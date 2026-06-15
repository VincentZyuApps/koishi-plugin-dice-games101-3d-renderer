import type { MarkdownContext } from './types'

export const key = '8-lambert' as const
export const title = 'Lambert 漫反射光照'

export function render(ctx: MarkdownContext): string {
  const SQRT3 = Math.sqrt(3)
  const maxDot = 1 / SQRT3
  const F = (v: number) => v.toFixed(4)

  return [
    '### [8] 💡 Lambert 漫反射',
    '',
    '$$ L_d = k_d \\times \\max(0,\\, \\hat{n} \\cdot \\hat{l}) $$',
    '',
    '$$ \\hat{l} = \\text{normalize}(1, 1, 1) = \\left(\\frac{1}{\\sqrt{3}}, \\frac{1}{\\sqrt{3}}, \\frac{1}{\\sqrt{3}}\\right) $$',
    '',
    `$$ k_d = ${ctx.diffuse} $$`,
    '',
    `$$ \\hat{n} \\cdot \\hat{l} \\in \\left[-\\frac{1}{\\sqrt{3}}, \\frac{1}{\\sqrt{3}}\\right] = [-${F(maxDot)}, \\, ${F(maxDot)}] $$`,
    '',
    `$$ L_d = ${ctx.diffuse} \\times \\max(0,\\, \\hat{n} \\cdot \\hat{l}) $$`,
    '',
    '> 背光面 n̂·l̂ < 0，被 max(0,·) 截断为 0，仅靠环境光补亮。',
    String.raw`> 正对面约 ${F(ctx.diffuse * maxDot)}（与 ${F(ctx.ambient)} 环境光合成最终亮度）。`,
  ].join('\n')
}
