import type { MarkdownContext } from './types'

export const key = '9-blinn-phong' as const
export const title = 'Blinn-Phong 镜面高光'

export function render(ctx: MarkdownContext): string {
  return [
    '### [9] ✨ Blinn-Phong 高光',
    '',
    '$$ L_s = k_s \\times \\max(0,\\, \\hat{n} \\cdot \\hat{h})^{\\,p} $$',
    '',
    '$$ \\hat{h} = \\text{normalize}(\\hat{l} + \\hat{v}) $$',
    '',
    `$$ k_s = ${ctx.specular}, \\quad p = ${ctx.shininess} $$`,
    '',
    String.raw`$$ L_s = ${ctx.specular} \times \max(0,\, \hat{n} \cdot \hat{h})^{\,${ctx.shininess}} $$`,
    '',
    '半角向量 $\\hat{h}$ 介于光源方向 $\\hat{l}$ 与视线方向 $\\hat{v}$ 之间。',
    String.raw`锐度 p=${ctx.shininess} 控制高光集中程度 — p 越大光斑越小越亮。`,
    '对于背向光源的面，$\\hat{n} \\cdot \\hat{h} < 0$ 被截断，无高光。',
    '',
    '> Blinn-Phong 由 Jim Blinn 于 1977 年提出，用半角向量替代 Phong 模型的反射向量，计算更高效。',
  ].join('\n')
}
