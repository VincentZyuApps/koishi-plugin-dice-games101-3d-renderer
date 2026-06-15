import type { MarkdownContext } from './types'

export const key = '6-normal-matrix' as const
export const title = '法线矩阵'

export function render(ctx: MarkdownContext): string {
  const rad = (d: number) => d * Math.PI / 180
  const cy = Math.cos(rad(ctx.yaw)), sy = Math.sin(rad(ctx.yaw))
  const cp = Math.cos(rad(ctx.pitch)), sp = Math.sin(rad(ctx.pitch))
  const cr = Math.cos(rad(ctx.roll)), sr = Math.sin(rad(ctx.roll))

  // Matrix entries (same Rz * Rx * Ry as step2)
  const m00 = cy * cr - sr * sp * sy,
    m01 = -sr * cp,
    m02 = cr * sy + sr * sp * cy
  const m10 = sr * cy + cr * sp * sy,
    m11 = cr * cp,
    m12 = sr * sy - cr * sp * cy
  const m20 = -cp * sy,
    m21 = sp,
    m22 = cp * cy

  const F = (v: number) => v.toFixed(3)

  return [
    '### [6] 📏 法线矩阵',
    '',
    '$$ N = (MV)^{-\\top} $$',
    '',
    '$$ N = \\begin{bmatrix}',
    `${F(m00)} & ${F(m01)} & ${F(m02)} \\\\`,
    `${F(m10)} & ${F(m11)} & ${F(m12)} \\\\`,
    `${F(m20)} & ${F(m21)} & ${F(m22)}`,
    '\\end{bmatrix} $$',
    '',
    '> 法线不能直接乘 Model-View 矩阵 — 非均匀缩放会扭曲法线方向。',
    '正确做法是乘 $(MV)^{-\\top}$（逆转置矩阵）。',
    '> 本例中 M 为纯旋转（正交矩阵），故 N 等同于 M 的 3×3 子块。',
  ].join('\n')
}
