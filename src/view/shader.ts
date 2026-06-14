import { Vec2, Vec3 } from '../math/vec'
import { Vec4 } from '../math/vec'

/** 片段着色器的输入载荷（由光栅化器经透视校正插值后传入）。 */
export interface ShaderPayload {
  normal: Vec3    // 插值后的单位法线（经法线矩阵变换，已归一化）
  viewPos: Vec3   // 视图空间中的片段位置（用于高级光照，当前未使用）
  uv: Vec2        // 透视校正后的 UV 坐标，范围 [0,1]²
  faceId: number  // 骰子面编号（1-6），用于查找该面的点数布局
}

/** 片段着色器函数类型：输入插值数据，输出线性 RGB 颜色（范围 [0,1]）。 */
export type FragmentShader = (p: ShaderPayload) => Vec3

/**
 * 三角形图元，携带顶点属性及绑定的片段着色器。
 * 对应 GPU 管线中一个已经过顶点处理的三角形原始数据。
 */
export interface Triangle {
  vertices: [Vec4, Vec4, Vec4]  // 模型空间齐次坐标（w=1）
  normals:  [Vec3, Vec3, Vec3]  // 每顶点法线
  uvs:      [Vec2, Vec2, Vec2]  // 每顶点 UV 坐标
  faceId:   number
  shader:   FragmentShader
}

/**
 * 各面点数在 UV 空间 [0,1]² 中的圆心坐标布局。
 * UV (0,0)=左下，(1,1)=右上，(0.5,0.5)=面中心。
 * 坐标参考标准骰子排列惯例（1点居中，2点对角，6点双列3行等）。
 *
 * 片段着色时：对每个点圆心 c，计算 UV 到 c 的距离²，若 < R² 则涂黑（点数凹坑）。
 * 使用距离平方避免开方，属标准圆形遮罩技巧。
 */
const DOT_PATTERNS: Record<number, Vec2[]> = {
  1: [{x:.5,y:.5}],
  2: [{x:.25,y:.75},{x:.75,y:.25}],
  3: [{x:.25,y:.75},{x:.5,y:.5},{x:.75,y:.25}],
  4: [{x:.25,y:.25},{x:.75,y:.25},{x:.25,y:.75},{x:.75,y:.75}],
  5: [{x:.25,y:.25},{x:.75,y:.25},{x:.5,y:.5},{x:.25,y:.75},{x:.75,y:.75}],
  6: [{x:.25,y:.2},{x:.75,y:.2},{x:.25,y:.5},{x:.75,y:.5},{x:.25,y:.8},{x:.75,y:.8}],
}

/** 平行光方向（归一化），(1,1,1) 表示右上前方45°光源。 */
const LIGHT_DIR = new Vec3(1,1,1).normalized()
/** 环境光系数：最暗处仍保留 15% 亮度，防止背光面全黑。 */
const AMBIENT = 0.15
/** 点数圆圈半径的平方（r=0.09），用于圆形内点判断 (dx²+dy² < r²) 避免开方。 */
const R2 = 0.09 * 0.09

/**
 * 骰子着色器工厂：Lambert 漫反射 + 点数圆形遮罩。
 *
 * Lambert 物理背景：
 *   理想漫反射面（Lambertian surface）向所有方向均匀散射光线，
 *   亮度与入射角余弦成正比（Lambert's cosine law）：L ∝ cos θ = n̂·l̂
 *   这是辐射度量学的基本定律，也是最简单的非镜面光照模型。
 *
 * 本实现：L = ambient + diffuse × max(0, n̂·l̂)
 *   ambient：模拟间接照明（天光/环境），防止背光面全黑（物理上不严格但视觉合理）
 *   diffuse：直接光贡献，max(0,·) 截断负值（背光面不会"吸光"）
 *   输出灰度（骰子本体为白色），由 clamp() 保证 [0,1] 范围
 */
export function makeDiceShader(ambient: number, diffuse: number): FragmentShader {
  return (p) => {
    // 点数圆形判断：(u-cx)² + (v-cy)² < r²（省去开方，直接比较平方距离）
    for (const c of DOT_PATTERNS[p.faceId]) {
      const dx=p.uv.x-c.x, dy=p.uv.y-c.y
      if (dx*dx+dy*dy < R2) return new Vec3(0.05,0.05,0.05)  // 点凹坑：近黑色
    }
    // Lambert 漫反射：n̂·l̂ 为入射角余弦，背光时为负，截断为0
    const lit = ambient + diffuse * Math.max(0, p.normal.dot(LIGHT_DIR))
    return new Vec3(lit, lit, lit)  // 灰度：R=G=B（骰子为白色底面）
  }
}

export const diceShader: FragmentShader = makeDiceShader(0.15, 0.85)
