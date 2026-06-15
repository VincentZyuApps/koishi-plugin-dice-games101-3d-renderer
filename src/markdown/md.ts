import type { MarkdownContext, StepKey } from './types'
import { STEPS, sortByDefinedOrder } from './all-steps'

export function buildDiceMarkdown(
  ctx: MarkdownContext,
  enabledSteps: StepKey[],
  label?: string,
): string {
  const parts: string[] = [
    '# 🎲 骰子渲染结果 ✨',
    '',
    '> 🎮 好玩不awa 🎉',
    '',
    '### 📚 参考链接',
    '',
    '- [🎓 GAMES101 课程](mqqapi://aio/%69nlinecmd?command=https://sites.cs.ucsb.edu/~lingqi/teaching/games101.html&enter=true)',
    '- [📺 闫令琪老师 B 站课程](mqqapi://aio/%69nlinecmd?command=https://www.bilibili.com/video/BV1X7411F744&enter=true)',
    '- [💡 Lambert 漫反射](mqqapi://aio/%69nlinecmd?command=https://en.wikipedia.org/wiki/Lambertian_reflectance&enter=true)',
    '- [✨ Blinn-Phong 镜面高光](mqqapi://aio/%69nlinecmd?command=https://en.wikipedia.org/wiki/Blinn%E2%80%93Phong_reflection_model&enter=true)',
    '',
    '---',
    '',
    '> ⚠️ 电脑QQ暂不支持渲染LaTeX，请去手机QQ查看',
  ]

  const sorted = sortByDefinedOrder(enabledSteps)
  for (const key of sorted) {
    const step = STEPS[key]
    if (!step) continue
    parts.push('')
    parts.push(step.render(ctx))
  }

  parts.push('')
  parts.push('---')
  parts.push('')
  parts.push(`| 参数 | 值 |`)
  parts.push(`|---|---|`)
    parts.push(`| 🎯 YPR | ${ctx.yaw}° / ${ctx.pitch}° / ${ctx.roll}° |`)
  parts.push(`| 🎲 正面 | ${ctx.face}点 (偏转 ${ctx.angleDeg.toFixed(1)}°) |`)
  parts.push(`| ⏱️ 耗时 | ${ctx.elapsed}ms |`)
  if (label) {
    parts.push(`| 📐 评价 | ${label} |`)
  }

  return parts.join('\n')
}
