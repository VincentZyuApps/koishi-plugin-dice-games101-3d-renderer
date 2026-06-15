import type { MarkdownContext } from './types'

export const key = '7-face-detection' as const
export const title = '正面检测'

export function render(ctx: MarkdownContext): string {
  const rad = (d: number) => d * Math.PI / 180
  const cy = Math.cos(rad(ctx.yaw)), sy = Math.sin(rad(ctx.yaw))
  const cp = Math.cos(rad(ctx.pitch)), sp = Math.sin(rad(ctx.pitch))
  const cr = Math.cos(rad(ctx.roll)), sr = Math.sin(rad(ctx.roll))

  // Model matrix row 3 (z-axis direction): d[8], d[9], d[10]
  const dx = -sy * cr + cy * sp * sr
  const dy = sy * sr + cy * sp * cr
  const dz = cy * cp

  // 6 face normals
  type FaceInfo = { num: number; nx: number; ny: number; nz: number }
  const faces: FaceInfo[] = [
    { num: 1, nx: 0, ny: 0, nz: 1 },
    { num: 6, nx: 0, ny: 0, nz: -1 },
    { num: 2, nx: 0, ny: 1, nz: 0 },
    { num: 5, nx: 0, ny: -1, nz: 0 },
    { num: 3, nx: 1, ny: 0, nz: 0 },
    { num: 4, nx: -1, ny: 0, nz: 0 },
  ]

  const F = (v: number) => v.toFixed(3)
  const rows = faces.map((f) => {
    const dot = dx * f.nx + dy * f.ny + dz * f.nz
    const star = f.num === ctx.face ? ' ← 最大' : ''
    return `| ${f.num}点 | (${f.nx},${f.ny},${f.nz}) | ${F(dot)}${star} |`
  })

  return [
    '### [7] 🎯 正面检测',
    '',
    '$$ \\text{rotated\\_normal}_z = d_8 \\cdot n_x + d_9 \\cdot n_y + d_{10} \\cdot n_z $$',
    '',
    String.raw`$$ \text{世界Z轴方向} = (${F(dx)}, ${F(dy)}, ${F(dz)}) $$`,
    '',
    '| 面 | 初始法线 | Z分量 |',
    '|---|---|---|',
    ...rows,
    '',
    String.raw`$$ \text{最朝镜头面} = ${ctx.face}\!\text{点} $$`,
    '',
    '> 通过计算各面初始法线经旋转后的 Z 分量，Z 最大者为最朝向镜头的面。',
  ].join('\n')
}
