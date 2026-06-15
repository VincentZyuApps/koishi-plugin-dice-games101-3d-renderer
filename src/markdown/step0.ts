import type { MarkdownContext } from './types'

export const key = '0-ypr-to-rad' as const
export const title = '角度转弧度'

export function render(ctx: MarkdownContext): string {
  const rad = (d: number) => (d * Math.PI / 180).toFixed(4)
  return [
    '### [0] 🔄 角度转弧度',
    '',
    '$$ \\theta_{\\text{rad}} = \\theta_{deg} \\times \\frac{\\pi}{180} $$',
    '',
    String.raw`$$ \text{yaw}   = ${ctx.yaw}^\circ \times \frac{\pi}{180} = ${rad(ctx.yaw)} $$`,
    String.raw`$$ \text{pitch} = ${ctx.pitch}^\circ \times \frac{\pi}{180} = ${rad(ctx.pitch)} $$`,
    String.raw`$$ \text{roll}  = ${ctx.roll}^\circ \times \frac{\pi}{180} = ${rad(ctx.roll)} $$`,
    '',
    '> 弧度 = 角度 × π/180。将用户输入的 YPR 角度转换为三角函数所需的弧度制。',
  ].join('\n')
}
