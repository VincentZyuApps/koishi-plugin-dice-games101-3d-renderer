import type { MarkdownContext } from './types'

export const key = '2-model-matrix' as const
export const title = 'Model 矩阵合成'

export function render(ctx: MarkdownContext): string {
  const rad = (d: number) => d * Math.PI / 180
  const F = (v: number) => v.toFixed(3)
  const cy = Math.cos(rad(ctx.yaw)), sy = Math.sin(rad(ctx.yaw))
  const cp = Math.cos(rad(ctx.pitch)), sp = Math.sin(rad(ctx.pitch))
  const cr = Math.cos(rad(ctx.roll)), sr = Math.sin(rad(ctx.roll))

  // M = Rz * Rx * Ry — compute key entries
  const m00 = cy * cr - sr * sp * sy
  const m01 = -sr * cp
  const m02 = cr * sy + sr * sp * cy
  const m10 = sr * cy + cr * sp * sy
  const m11 = cr * cp
  const m12 = sr * sy - cr * sp * cy
  const m20 = -cp * sy
  const m21 = sp
  const m22 = cp * cy

  return [
    '### [2] 🧱 Model 合成',
    '',
    '$$ M = R_z(\\text{roll}) \\cdot R_x(\\text{pitch}) \\cdot R_y(\\text{yaw}) $$',
    '',
    '$$ M = \\begin{bmatrix}',
    `${F(m00)} & ${F(m01)} & ${F(m02)} & 0 \\\\`,
    `${F(m10)} & ${F(m11)} & ${F(m12)} & 0 \\\\`,
    `${F(m20)} & ${F(m21)} & ${F(m22)} & 0 \\\\`,
    '0 & 0 & 0 & 1',
    '\\end{bmatrix} $$',
    '',
    '> 旋转顺序：先绕Y轴偏航 → 再绕X轴俯仰 → 最后绕Z轴翻滚（右乘顺序）',
  ].join('\n')
}
