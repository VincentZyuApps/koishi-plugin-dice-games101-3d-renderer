import type { MarkdownContext } from './types'

export const key = '4-perspective' as const
export const title = '透视投影矩阵'

export function render(ctx: MarkdownContext): string {
  const fovRad = ctx.fov * Math.PI / 360
  const t = ctx.near * Math.tan(fovRad)
  const r = t * (ctx.width / ctx.height)
  const F = (v: number) => v.toFixed(4)
  const p00 = F(ctx.near / r)
  const p11 = F(ctx.near / t)
  const p22 = F(-(ctx.far + ctx.near) / (ctx.far - ctx.near))
  const p23 = F(-2 * ctx.far * ctx.near / (ctx.far - ctx.near))

  return [
    '### [4] 🔭 透视投影',
    '',
    String.raw`$$ t = n \cdot \tan(\frac{\text{fov}}{2}) = ${ctx.near} \times \tan(${ctx.fov}^\circ/2) = ${F(t)} $$`,
    '',
    String.raw`$$ r = t \cdot \text{aspect} = ${F(t)} \times \frac{${ctx.width}}{${ctx.height}} = ${F(r)} $$`,
    '',
    '$$ P = \\begin{bmatrix}',
    'n/r & 0 & 0 & 0 \\\\',
    '0 & n/t & 0 & 0 \\\\',
    '0 & 0 & -\\frac{f+n}{f-n} & -\\frac{2fn}{f-n} \\\\',
    '0 & 0 & -1 & 0',
    '\\end{bmatrix} =',
    '\\begin{bmatrix}',
    `${p00} & 0 & 0 & 0 \\\\`,
    `0 & ${p11} & 0 & 0 \\\\`,
    `0 & 0 & ${p22} & ${p23} \\\\`,
    '0 & 0 & -1 & 0',
    '\\end{bmatrix} $$',
    '',
    '> 视锥体由 fov、aspect、near、far 定义。透视除法（÷w）后自然产生近大远小效果。',
  ].join('\n')
}
