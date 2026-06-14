import { Vec2, Vec3, Vec4 } from '../math/vec'
import { Mat4 } from '../math/mat'
import { ShaderPayload, FragmentShader, Triangle } from './shader'

export type { ShaderPayload, FragmentShader, Triangle }

/**
 * 软件光栅化器：CPU 上完整实现 GPU 渲染管线。
 * 持有两个缓冲区：
 *   frameBuffer — 线性 RGB [0,1] 颜色，最终编码为 PNG
 *   depthBuffer — 每像素深度值（越小越近），初始化为 +∞
 */
export class Rasterizer {
  frameBuffer: Vec3[]
  depthBuffer: number[]
  private mvp!: Mat4        // Proj × View × Model（顶点完整变换）
  private vp!: Mat4         // Proj × View（世界空间线段用）
  private mv!: Mat4         // View × Model（视图空间光照用）
  private normalMat!: Mat4  // (MV)⁻ᵀ（法线正确变换矩阵）

  /** 初始化帧缓冲（暗蓝灰背景）与深度缓冲（+∞）。 */
  constructor(public width: number, public height: number) {
    this.frameBuffer = Array.from({length: width*height}, () => new Vec3(0.15,0.15,0.18))
    this.depthBuffer = new Array(width*height).fill(Infinity)
  }

  /**
   * 预计算并缓存所有变换矩阵。
   * 法线矩阵 = (MV)⁻ᵀ：法线不能直接乘 MV，非均匀缩放会扭曲方向，
   * 必须用逆转置矩阵才能保证法线始终垂直于表面。
   */
  setMVP(model: Mat4, view: Mat4, proj: Mat4) {
    this.mv = view.multiply(model)
    this.mvp = proj.multiply(this.mv)
    this.vp = proj.multiply(view)
    this.normalMat = this.mv.inverse().transpose()
  }

  /**
   * 在两个坐标点之间光栅化一条线段（DDA 算法，带深度测试）。
   * @param mat 投影矩阵，默认 this.vp（世界空间），传 this.mvp 则为模型空间
   * @param dashed 虚线模式：每8像素交替绘制/跳过（用于负轴方向）
   */
  drawLine(p0: Vec3, p1: Vec3, color: Vec3, dashed = false, mat?: Mat4) {
    const { width, height } = this
    // 深度范围映射系数：将 NDC z∈[-1,1] 映射到 [f2-f1, f2+f1]（与 draw() 保持一致）
    const f1 = (100 - 0.1) / 2, f2 = (100 + 0.1) / 2
    const m = mat ?? this.vp
    const project = (v: Vec3) => {
      const c = m.mulVec4(new Vec4(v.x, v.y, v.z, 1))
      return { x: 0.5*width*(c.x/c.w+1), y: 0.5*height*(1-c.y/c.w), z: c.z/c.w*f1+f2 }
    }
    const a = project(p0), b = project(p1)
    // 步数 = max(Δx, Δy)，保证逐像素连续（DDA 的核心）
    const steps = Math.max(Math.abs(b.x-a.x), Math.abs(b.y-a.y), 1)
    for (let i = 0; i <= steps; i++) {
      if (dashed && Math.floor(i / 8) % 2 === 1) continue
      const t = i / steps
      const x = Math.round(a.x + (b.x-a.x)*t)
      const y = Math.round(a.y + (b.y-a.y)*t)
      const z = a.z + (b.z-a.z)*t
      if (x < 0 || x >= width || y < 0 || y >= height) continue
      const idx = y*width + x
      if (z < this.depthBuffer[idx]) {
        this.depthBuffer[idx] = z
        this.frameBuffer[idx] = color
      }
    }
  }

  /**
   * 核心三角形光栅化：遍历所有三角形，完成完整渲染管线：
   *   MVP变换 → 法线变换 → 透视除法 → 视口变换
   *   → AABB包围盒 → 重心坐标内外测试 → Z-buffer → 透视校正插值 → 着色
   */
  draw(triangles: Triangle[]) {
    const { width, height } = this
    // f1/f2 将 NDC z∈[-1,1] 线性映射到正数深度区间（near=0.1, far=100）
    const f1 = (100 - 0.1) / 2, f2 = (100 + 0.1) / 2

    for (const tri of triangles) {
      // ── 1. MVP 变换：模型空间 → 裁剪空间（齐次坐标）──
      const vv = tri.vertices.map(v => this.mvp.mulVec4(v)) as [Vec4,Vec4,Vec4]
      // 视图空间顶点位置（用于光照计算，保留供着色器使用）
      const viewPos = tri.vertices.map(v => this.mv.mulVec4(v).toVec3()) as [Vec3,Vec3,Vec3]
      // ── 2. 法线变换：使用 (MV)⁻ᵀ，w=0 表示方向向量（不受平移影响）──
      const tn = tri.normals.map(n => {
        const r = this.normalMat.mulVec4(new Vec4(n.x,n.y,n.z,0))
        return new Vec3(r.x,r.y,r.z).normalized()
      }) as [Vec3,Vec3,Vec3]

      // ── 3. 透视除法：裁剪空间 → NDC [-1,1]³，w 分量存储 1/w_clip 供插值用 ──
      const v = vv.map(v4 => {
        return new Vec4(v4.x/v4.w, v4.y/v4.w, v4.z/v4.w, 1/v4.w)
      }) as [Vec4,Vec4,Vec4]

      // ── 4. 视口变换：NDC → 屏幕像素坐标，Y 轴保持不翻转（y=0 在下方）──
      const screen = v.map(v4 => ({
        x: 0.5*width*(v4.x+1),
        y: 0.5*height*(1-v4.y),
        z: v4.z*f1+f2,
        invW: v4.w,  // 注意：透视除法后 w 中存的是 1/w_clip，不是 w_clip 本身
      }))

      // ── 5. AABB 包围盒：只遍历三角形覆盖区域的像素，裁剪到帧缓冲范围内 ──
      const [s0,s1,s2] = screen
      const minX = Math.max(0, Math.floor(Math.min(s0.x,s1.x,s2.x)))
      const maxX = Math.min(width-1, Math.ceil(Math.max(s0.x,s1.x,s2.x)))
      const minY = Math.max(0, Math.floor(Math.min(s0.y,s1.y,s2.y)))
      const maxY = Math.min(height-1, Math.ceil(Math.max(s0.y,s1.y,s2.y)))

      for (let y=minY;y<=maxY;y++) for (let x=minX;x<=maxX;x++) {
        // ── 6. 重心坐标测试：像素中心 (x+0.5, y+0.5) 是否在三角形内 ──
        if (!insideTriangle(x+0.5, y+0.5, s0, s1, s2)) continue
        const [alpha,beta,gamma] = barycentric(x+0.5, y+0.5, s0, s1, s2)

        // ── 7. Z-buffer 深度测试：屏幕空间 z 可以直接线性插值（不需要透视校正）──
        const zInterp = alpha*s0.z + beta*s1.z + gamma*s2.z
        const idx = y*width+x
        if (zInterp >= this.depthBuffer[idx]) continue  // 被遮挡，丢弃
        this.depthBuffer[idx] = zInterp

        // ── 8. 透视校正插值：属性在 3D 中与 1/w 线性，先插值 f/w 和 1/w，再相除 ──
        // wRecip = Σ λᵢ/wᵢ（分母），用于还原正确属性值
        const wRecip = alpha*s0.invW + beta*s1.invW + gamma*s2.invW

        function pcInterp3(a0:Vec3,a1:Vec3,a2:Vec3): Vec3 {
          return a0.scale(alpha*s0.invW).add(a1.scale(beta*s1.invW)).add(a2.scale(gamma*s2.invW)).scale(1/wRecip)
        }
        function pcInterpUV(u0:Vec2,u1:Vec2,u2:Vec2): Vec2 {
          return {
            x:(u0.x*alpha*s0.invW + u1.x*beta*s1.invW + u2.x*gamma*s2.invW)/wRecip,
            y:(u0.y*alpha*s0.invW + u1.y*beta*s1.invW + u2.y*gamma*s2.invW)/wRecip,
          }
        }

        // ── 9. 调用片段着色器，结果 clamp 到 [0,1] 后写入帧缓冲 ──
        const payload: ShaderPayload = {
          normal: pcInterp3(...tn).normalized(),
          viewPos: pcInterp3(...viewPos),
          uv: pcInterpUV(...tri.uvs),
          faceId: tri.faceId,
        }
        this.frameBuffer[idx] = tri.shader(payload).clamp()
      }
    }
  }

  /**
   * 绘制骰子本地坐标轴（随骰子旋转，使用 mvp 矩阵）。
   * ❤️ X / 💚 Y / 💙 Z，正轴实线+箭头，负轴虚线，两端标注 ±X/±Y/±Z。
   * 轴长 0.8：略超骰子半边长 0.5，确保视觉上延伸超出骰子表面。
   */
  drawAxes() {
    const len = 1.23456789, O = new Vec3(0, 0, 0)
    const { width, height } = this
    // 将模型空间点投影到屏幕（仅用于箭头方向计算，无需深度）
    const toScreen = (v: Vec3) => {
      const c = this.mvp.mulVec4(new Vec4(v.x, v.y, v.z, 1))
      return { x: 0.5*width*(c.x/c.w+1), y: 0.5*height*(1-c.y/c.w) }
    }
    const axes: [Vec3, Vec3, string][] = [
      [new Vec3(1,0,0), new Vec3(1, 0, 0), 'X'],  // ❤️ 红：+X=3点 -X=4点
      [new Vec3(0,1,0), new Vec3(0, 1, 0), 'Y'],  // 💚 绿：+Y=2点 -Y=5点
      [new Vec3(0,0,1), new Vec3(0, 0, 1), 'Z'],  // 💙 蓝：+Z=1点 -Z=6点
    ]
    for (const [dir, color, label] of axes) {
      this.drawLine(O, dir.scale(len), color, false, this.mvp)   // 正轴：实线
      this.drawLine(O, dir.scale(-len), color, true, this.mvp)   // 负轴：虚线
      this.drawArrowhead(toScreen(dir.scale(len)), toScreen(dir.scale(len * 0.85)), color)
      this.drawLabel(dir.scale(len * 0.9), '+' + label, color, this.mvp)
      this.drawLabel(dir.scale(-len * 0.9), '-' + label, color, this.mvp)
    }
  }

  /**
   * 在屏幕空间绘制箭头两翼（不做深度测试，始终覆盖在最上层）。
   * 翼线从 tip 出发，沿反方向旋转 ±30° 延伸 10px（cos30°=0.866, sin30°=0.5）。
   */
  private drawArrowhead(tip: {x:number,y:number}, near: {x:number,y:number}, color: Vec3) {
    const dx = tip.x - near.x, dy = tip.y - near.y
    const d = Math.sqrt(dx*dx + dy*dy) || 1
    const nx = dx/d, ny = dy/d
    const c = 0.866, s = 0.5, sz = 18  // cos30°, sin30°，箭翼长度 px
    const w1 = { x: tip.x - sz*(nx*c - ny*s), y: tip.y - sz*(ny*c + nx*s) }
    const w2 = { x: tip.x - sz*(nx*c + ny*s), y: tip.y - sz*(ny*c - nx*s) }
    // 沿垂直方向偏移 ±1px，绘制3条平行翼线使箭头达到3px粗细
    for (let t = -1; t <= 1; t++) {
      const ox = -ny * t, oy = nx * t
      this.drawScreenSeg({x: tip.x+ox, y: tip.y+oy}, {x: w1.x+ox, y: w1.y+oy}, color)
      this.drawScreenSeg({x: tip.x+ox, y: tip.y+oy}, {x: w2.x+ox, y: w2.y+oy}, color)
    }
  }

  /** 屏幕空间线段光栅化（DDA，无深度测试）。用于箭头等覆盖层绘制。 */
  private drawScreenSeg(a: {x:number,y:number}, b: {x:number,y:number}, color: Vec3) {
    const steps = Math.max(Math.abs(b.x-a.x), Math.abs(b.y-a.y), 1)
    for (let i = 0; i <= steps; i++) {
      const t = i/steps
      const x = Math.round(a.x + (b.x-a.x)*t), y = Math.round(a.y + (b.y-a.y)*t)
      if (x < 0 || x >= this.width || y < 0 || y >= this.height) continue
      this.frameBuffer[y * this.width + x] = color
    }
  }

  /**
   * 将3D 世界/模型坐标点投影到屏幕，在该处居中绘制文本标签（无深度测试）。
   * 每字符宽12px（5px×2缩放 + 2px间距），高10px。
   */
  private drawLabel(worldPos: Vec3, text: string, color: Vec3, mat?: Mat4) {
    const m = mat ?? this.vp
    const c = m.mulVec4(new Vec4(worldPos.x, worldPos.y, worldPos.z, 1))
    if (c.w <= 0) return  // 相机后方，跳过
    const sx = Math.round(0.5 * this.width  * (c.x / c.w + 1))
    const sy = Math.round(0.5 * this.height * (1 - c.y / c.w))
    let x = sx - Math.round(text.length * 6)  // 水平居中
    for (const ch of text) { this.drawGlyph(x, sy - 6, ch, color); x += 12 }
  }

  /**
   * 绘制一个5×5像素字体字符（2×缩放 → 10×10 像素），直接写帧缓冲。
   * FONT5 中 'X' 表示亮像素，' ' 表示透明。
   */
  private drawGlyph(sx: number, sy: number, ch: string, color: Vec3) {
    const glyph = FONT5[ch]
    if (!glyph) return
    for (let row = 0; row < 5; row++)
      for (let col = 0; col < 5; col++) {
        if (glyph[row][col] !== 'X') continue
        for (let dy = 0; dy < 2; dy++) for (let dx = 0; dx < 2; dx++) {
          const px = sx + col*2 + dx, py = sy + row*2 + dy
          if (px < 0 || px >= this.width || py < 0 || py >= this.height) continue
          this.frameBuffer[py * this.width + px] = color
        }
      }
  }
}

/** 5×5 像素位图字体，支持坐标轴标签所需的字符：+  -  X  Y  Z。'X'=亮，' '=透明。 */
const FONT5: Record<string, string[]> = {
  '+': ['     ', '  X  ', ' XXX ', '  X  ', '     '],
  '-': ['     ', '     ', ' XXX ', '     ', '     '],
  'X': ['X   X', ' X X ', '  X  ', ' X X ', 'X   X'],
  'Y': ['X   X', ' X X ', '  X  ', '  X  ', '  X  '],
  'Z': ['XXXXX', '   X ', '  X  ', ' X   ', 'XXXXX'],
}

type Pt = { x:number, y:number }

/**
 * 2D 有向面积（叉积 z 分量）：cross(a-o, b-o)。
 * 正值表示 a→b 相对于 o 是逆时针方向。用于边缘函数和重心坐标计算。
 */
function cross2d(o:Pt, a:Pt, b:Pt) {
  return (a.x-o.x)*(b.y-o.y) - (a.y-o.y)*(b.x-o.x)
}

/**
 * 判断点 (px,py) 是否在三角形 abc 内（含边界）。
 * 原理：对三条有向边各作叉积（边缘函数），若三个值符号一致则点在内部。
 * 同时支持顺时针和逆时针绕向的三角形。
 */
function insideTriangle(px:number, py:number, a:Pt, b:Pt, c:Pt) {
  const p={x:px,y:py}
  const d0=cross2d(a,b,p), d1=cross2d(b,c,p), d2=cross2d(c,a,p)
  return (d0>=0&&d1>=0&&d2>=0)||(d0<=0&&d1<=0&&d2<=0)
}

/**
 * 计算点 (px,py) 相对于三角形 abc 的重心坐标 (α, β, γ)，满足 α+β+γ=1。
 * 使用面积比法（叉积）推导：
 *   α = Area(PBC)/Area(ABC)，β = Area(APC)/Area(ABC)，γ = 1-α-β
 * 展开后得到线性方程组的解，denom = 2×Area(ABC)（叉积形式）。
 * 注意：这是屏幕空间的重心坐标，属性插值需要透视校正（见 draw()）。
 */
function barycentric(px:number, py:number, a:Pt, b:Pt, c:Pt): [number,number,number] {
  const denom = (b.y-c.y)*(a.x-c.x)+(c.x-b.x)*(a.y-c.y)
  const alpha = ((b.y-c.y)*(px-c.x)+(c.x-b.x)*(py-c.y))/denom
  const beta  = ((c.y-a.y)*(px-c.x)+(a.x-c.x)*(py-c.y))/denom
  return [alpha, beta, 1-alpha-beta]
}
