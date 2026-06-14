import { Vec3, Vec4 } from './vec'

/**
 * 行主序（row-major）4×4 矩阵，使用 Float64Array 存储。
 * 索引约定：d[row*4 + col]，d[0..3] = 第0行。
 * 与 OpenGL 列主序不同；mulVec4 中 v 视为列向量（M·v）。
 */
export class Mat4 {
  constructor(public d = new Float64Array(16)) {}

  /** 单位矩阵 I（对角线全1）。 */
  static identity(): Mat4 {
    const m = new Mat4()
    m.d[0]=m.d[5]=m.d[10]=m.d[15]=1
    return m
  }

  /** 从二维数组 rows[r][c] 构造矩阵。 */
  static fromRows(rows: number[][]): Mat4 {
    const m = new Mat4()
    for (let r=0;r<4;r++) for (let c=0;c<4;c++) m.d[r*4+c]=rows[r][c]
    return m
  }

  /**
   * 矩阵乘法 this × b，result[r][c] = Σ_k this[r][k]·b[k][c]。
   * MVP 组合顺序：proj.multiply(view).multiply(model)（右结合，model 最先作用于顶点）。
   */
  multiply(b: Mat4): Mat4 {
    const m = new Mat4()
    for (let r=0;r<4;r++) for (let c=0;c<4;c++) {
      let s=0; for (let k=0;k<4;k++) s+=this.d[r*4+k]*b.d[k*4+c]
      m.d[r*4+c]=s
    }
    return m
  }

  /** 矩阵-列向量乘法 M·v，用于顶点变换。 */
  mulVec4(v: Vec4): Vec4 {
    const d=this.d, x=v.x,y=v.y,z=v.z,w=v.w
    return new Vec4(
      d[0]*x+d[1]*y+d[2]*z+d[3]*w,
      d[4]*x+d[5]*y+d[6]*z+d[7]*w,
      d[8]*x+d[9]*y+d[10]*z+d[11]*w,
      d[12]*x+d[13]*y+d[14]*z+d[15]*w,
    )
  }

  /** 转置：行列互换。纯旋转矩阵满足 Rᵀ = R⁻¹（正交矩阵性质）。 */
  transpose(): Mat4 {
    const m = new Mat4()
    for (let r=0;r<4;r++) for (let c=0;c<4;c++) m.d[r*4+c]=this.d[c*4+r]
    return m
  }

  /**
   * 矩阵求逆：代数余子式展开法（Classical Adjoint）。
   *   M⁻¹ = adj(M) / det(M)
   * adj(M) 的每个元素是对应位置的代数余子式（cofactor，含符号的3×3子式行列式）。
   * 16个展开式由手工推导写死，避免递归计算。
   * |det| < ε 时（奇异矩阵）返回单位矩阵。
   * 主要用于计算法线变换矩阵 (MV)⁻ᵀ，防止非均匀缩放扭曲法线方向。
   */
  inverse(): Mat4 {
    const m=this.d, inv=new Float64Array(16)
    inv[0] = m[5]*m[10]*m[15]-m[5]*m[11]*m[14]-m[9]*m[6]*m[15]+m[9]*m[7]*m[14]+m[13]*m[6]*m[11]-m[13]*m[7]*m[10]
    inv[4] = -m[4]*m[10]*m[15]+m[4]*m[11]*m[14]+m[8]*m[6]*m[15]-m[8]*m[7]*m[14]-m[12]*m[6]*m[11]+m[12]*m[7]*m[10]
    inv[8] = m[4]*m[9]*m[15]-m[4]*m[11]*m[13]-m[8]*m[5]*m[15]+m[8]*m[7]*m[13]+m[12]*m[5]*m[11]-m[12]*m[7]*m[9]
    inv[12]= -m[4]*m[9]*m[14]+m[4]*m[10]*m[13]+m[8]*m[5]*m[14]-m[8]*m[6]*m[13]-m[12]*m[5]*m[10]+m[12]*m[6]*m[9]
    inv[1] = -m[1]*m[10]*m[15]+m[1]*m[11]*m[14]+m[9]*m[2]*m[15]-m[9]*m[3]*m[14]-m[13]*m[2]*m[11]+m[13]*m[3]*m[10]
    inv[5] = m[0]*m[10]*m[15]-m[0]*m[11]*m[14]-m[8]*m[2]*m[15]+m[8]*m[3]*m[14]+m[12]*m[2]*m[11]-m[12]*m[3]*m[10]
    inv[9] = -m[0]*m[9]*m[15]+m[0]*m[11]*m[13]+m[8]*m[1]*m[15]-m[8]*m[3]*m[13]-m[12]*m[1]*m[11]+m[12]*m[3]*m[9]
    inv[13]= m[0]*m[9]*m[14]-m[0]*m[10]*m[13]-m[8]*m[1]*m[14]+m[8]*m[2]*m[13]+m[12]*m[1]*m[10]-m[12]*m[2]*m[9]
    inv[2] = m[1]*m[6]*m[15]-m[1]*m[7]*m[14]-m[5]*m[2]*m[15]+m[5]*m[3]*m[14]+m[13]*m[2]*m[7]-m[13]*m[3]*m[6]
    inv[6] = -m[0]*m[6]*m[15]+m[0]*m[7]*m[14]+m[4]*m[2]*m[15]-m[4]*m[3]*m[14]-m[12]*m[2]*m[7]+m[12]*m[3]*m[6]
    inv[10]= m[0]*m[5]*m[15]-m[0]*m[7]*m[13]-m[4]*m[1]*m[15]+m[4]*m[3]*m[13]+m[12]*m[1]*m[7]-m[12]*m[3]*m[5]
    inv[14]= -m[0]*m[5]*m[14]+m[0]*m[6]*m[13]+m[4]*m[1]*m[14]-m[4]*m[2]*m[13]-m[12]*m[1]*m[6]+m[12]*m[2]*m[5]
    inv[3] = -m[1]*m[6]*m[11]+m[1]*m[7]*m[10]+m[5]*m[2]*m[11]-m[5]*m[3]*m[10]-m[9]*m[2]*m[7]+m[9]*m[3]*m[6]
    inv[7] = m[0]*m[6]*m[11]-m[0]*m[7]*m[10]-m[4]*m[2]*m[11]+m[4]*m[3]*m[10]+m[8]*m[2]*m[7]-m[8]*m[3]*m[6]
    inv[11]= -m[0]*m[5]*m[11]+m[0]*m[7]*m[9]+m[4]*m[1]*m[11]-m[4]*m[3]*m[9]-m[8]*m[1]*m[7]+m[8]*m[3]*m[5]
    inv[15]= m[0]*m[5]*m[10]-m[0]*m[6]*m[9]-m[4]*m[1]*m[10]+m[4]*m[2]*m[9]+m[8]*m[1]*m[6]-m[8]*m[2]*m[5]
    const det = m[0]*inv[0]+m[1]*inv[4]+m[2]*inv[8]+m[3]*inv[12]
    if (Math.abs(det)<1e-12) return Mat4.identity()
    const r = new Mat4()
    for (let i=0;i<16;i++) r.d[i]=inv[i]/det
    return r
  }

  /**
   * 绕 Y 轴旋转矩阵（偏航 yaw，输入角度为度）：
   *   Ry(θ) = [ cosθ  0  sinθ  0 ]
   *           [  0    1   0    0 ]
   *           [-sinθ  0  cosθ  0 ]
   *           [  0    0   0    1 ]
   *
   * 推导：Y 轴不变（行/列2全为 e_y），X-Z 平面内做2D旋转。
   * 2D旋转：(x,z) → (x·cosθ + z·sinθ, -x·sinθ + z·cosθ)
   * 注意符号：右手定则下绕 +Y 旋转，X→Z 为正方向（与绕 Z 的 X→Y 类推不同）。
   */
  static rotateY(deg: number): Mat4 {
    const r=deg*Math.PI/180, c=Math.cos(r), s=Math.sin(r)
    return Mat4.fromRows([[c,0,s,0],[0,1,0,0],[-s,0,c,0],[0,0,0,1]])
  }

  /**
   * 绕 X 轴旋转矩阵（俯仰 pitch）：
   *   Rx(θ) = [ 1   0     0    0 ]
   *           [ 0  cosθ -sinθ  0 ]
   *           [ 0  sinθ  cosθ  0 ]
   *           [ 0   0     0    1 ]
   *
   * 推导：X 轴不变，Y-Z 平面内做2D旋转。绕 +X 正方向看：Y→Z 为正旋转方向。
   */
  static rotateX(deg: number): Mat4 {
    const r=deg*Math.PI/180, c=Math.cos(r), s=Math.sin(r)
    return Mat4.fromRows([[1,0,0,0],[0,c,-s,0],[0,s,c,0],[0,0,0,1]])
  }

  /**
   * 绕 Z 轴旋转矩阵（翻滚 roll）：
   *   Rz(θ) = [ cosθ -sinθ  0  0 ]
   *           [ sinθ  cosθ  0  0 ]
   *           [  0     0    1  0 ]
   *           [  0     0    0  1 ]
   *
   * 推导：Z 轴不变，X-Y 平面内标准2D旋转。绕 +Z 正方向看：X→Y 为正旋转方向。
   * 三个旋转矩阵列向量即旋转后的坐标轴方向，均为单位正交基（det=1，保体积）。
   */
  static rotateZ(deg: number): Mat4 {
    const r=deg*Math.PI/180, c=Math.cos(r), s=Math.sin(r)
    return Mat4.fromRows([[c,-s,0,0],[s,c,0,0],[0,0,1,0],[0,0,0,1]])
  }

  /**
   * View 矩阵（lookAt）：将世界空间变换到相机空间。
   * 构建相机正交基：f = normalize(center-eye)，r = normalize(f×up)，u = r×f
   *   V = [ rx  ry  rz  -r·eye ]
   *       [ ux  uy  uz  -u·eye ]
   *       [-fx -fy -fz   f·eye ]   ← 前向轴取 -f（右手系，相机看向 -Z）
   *       [  0   0   0     1   ]
   */
  static lookAt(eye: Vec3, center: Vec3, up: Vec3): Mat4 {
    const f=center.sub(eye).normalized()
    const r=f.cross(up).normalized()
    const u=r.cross(f)
    return Mat4.fromRows([
      [r.x,r.y,r.z,-r.dot(eye)],
      [u.x,u.y,u.z,-u.dot(eye)],
      [-f.x,-f.y,-f.z,f.dot(eye)],
      [0,0,0,1],
    ])
  }

  /**
   * 透视投影矩阵：将视锥体映射到 NDC [-1,1]³。
   * t = near·tan(fovY/2)，r = t·aspect（近平面半高/半宽）
   *   P = [ n/r   0         0              0      ]
   *       [  0   n/t        0              0      ]
   *       [  0    0  -(f+n)/(f-n)  -2fn/(f-n)    ]
   *       [  0    0        -1              0      ]
   * w_clip = -z_view > 0，透视除法后实现近大远小效果。
   */
  static perspective(fovY: number, aspect: number, near: number, far: number): Mat4 {
    const t=Math.tan(fovY*Math.PI/360)*near, r=t*aspect
    return Mat4.fromRows([
      [near/r,0,0,0],
      [0,near/t,0,0],
      [0,0,-(far+near)/(far-near),-2*far*near/(far-near)],
      [0,0,-1,0],
    ])
  }
}
