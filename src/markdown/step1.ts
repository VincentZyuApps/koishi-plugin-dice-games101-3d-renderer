import type { MarkdownContext } from './types'

export const key = '1-rotation-matrices' as const
export const title = '旋转矩阵'

export function render(ctx: MarkdownContext): string {
  const rad = (d: number) => d * Math.PI / 180
  const F = (v: number) => v.toFixed(3)
  const cy = Math.cos(rad(ctx.yaw)), sy = Math.sin(rad(ctx.yaw))
  const cp = Math.cos(rad(ctx.pitch)), sp = Math.sin(rad(ctx.pitch))
  const cr = Math.cos(rad(ctx.roll)), sr = Math.sin(rad(ctx.roll))

  return [
    '### [1] 🔀 旋转矩阵',
    '',
    String.raw`$$ R_y(\text{yaw}=${ctx.yaw}^\circ) =`,
    '\\begin{bmatrix}',
    '\\cos\\theta & 0 & \\sin\\theta & 0 \\\\',
    '0 & 1 & 0 & 0 \\\\',
    '-\\sin\\theta & 0 & \\cos\\theta & 0 \\\\',
    '0 & 0 & 0 & 1',
    '\\end{bmatrix} =',
    '\\begin{bmatrix}',
    `${F(cy)} & 0 & ${F(sy)} & 0 \\\\`,
    '0 & 1 & 0 & 0 \\\\',
    `${F(-sy)} & 0 & ${F(cy)} & 0 \\\\`,
    '0 & 0 & 0 & 1',
    '\\end{bmatrix} $$',
    '',
    String.raw`$$ R_x(\text{pitch}=${ctx.pitch}^\circ) =`,
    '\\begin{bmatrix}',
    '1 & 0 & 0 & 0 \\\\',
    '0 & \\cos\\theta & -\\sin\\theta & 0 \\\\',
    '0 & \\sin\\theta & \\cos\\theta & 0 \\\\',
    '0 & 0 & 0 & 1',
    '\\end{bmatrix} =',
    '\\begin{bmatrix}',
    `1 & 0 & 0 & 0 \\\\`,
    `0 & ${F(cp)} & ${F(-sp)} & 0 \\\\`,
    `0 & ${F(sp)} & ${F(cp)} & 0 \\\\`,
    '0 & 0 & 0 & 1',
    '\\end{bmatrix} $$',
    '',
    String.raw`$$ R_z(\text{roll}=${ctx.roll}^\circ) =`,
    '\\begin{bmatrix}',
    '\\cos\\theta & -\\sin\\theta & 0 & 0 \\\\',
    '\\sin\\theta & \\cos\\theta & 0 & 0 \\\\',
    '0 & 0 & 1 & 0 \\\\',
    '0 & 0 & 0 & 1',
    '\\end{bmatrix} =',
    '\\begin{bmatrix}',
    `${F(cr)} & ${F(-sr)} & 0 & 0 \\\\`,
    `${F(sr)} & ${F(cr)} & 0 & 0 \\\\`,
    '0 & 0 & 1 & 0 \\\\',
    '0 & 0 & 0 & 1',
    '\\end{bmatrix} $$',
    '',
    '> 旋转矩阵为正交矩阵（Rᵀ = R⁻¹），由 cosθ / sinθ 构成，分别绕 X、Y、Z 轴旋转。',
  ].join('\n')
}
