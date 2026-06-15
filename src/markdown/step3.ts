import type { MarkdownContext } from './types'

export const key = '3-view-matrix' as const
export const title = 'View 变换 (lookAt)'

export function render(_ctx: MarkdownContext): string {
  // Camera setup is static: eye=(0,0,3), center=(0,0,0), up=(0,1,0)
  return [
    '### [3] 📷 View 变换',
    '',
    '$$ \\text{eye} = (0, 0, 3), \\quad \\text{center} = (0, 0, 0), \\quad \\text{up} = (0, 1, 0) $$',
    '',
    '$$ \\vec{f} = \\text{normalize}(\\text{center} - \\text{eye}) = (0, 0, -1) $$',
    '',
    '$$ \\vec{r} = \\text{normalize}(\\vec{f} \\times \\text{up}) = \\text{normalize}(1, 0, 0) = (1, 0, 0) $$',
    '',
    '$$ \\vec{u} = \\vec{r} \\times \\vec{f} = (0, 1, 0) $$',
    '',
    '$$ V = \\begin{bmatrix}',
    '\\vec{r}_x & \\vec{r}_y & \\vec{r}_z & -\\vec{r} \\cdot \\text{eye} \\\\',
    '\\vec{u}_x & \\vec{u}_y & \\vec{u}_z & -\\vec{u} \\cdot \\text{eye} \\\\',
    '-\\vec{f}_x & -\\vec{f}_y & -\\vec{f}_z & \\vec{f} \\cdot \\text{eye} \\\\',
    '0 & 0 & 0 & 1',
    '\\end{bmatrix} =',
    '\\begin{bmatrix}',
    '1 & 0 & 0 & 0 \\\\',
    '0 & 1 & 0 & 0 \\\\',
    '0 & 0 & 1 & -3 \\\\',
    '0 & 0 & 0 & 1',
    '\\end{bmatrix} $$',
    '',
    '> 相机位于世界空间 (0, 0, 3)，看向原点。前向 f 朝向 -Z，右向 r 朝向 +X，上向 u 朝向 +Y。',
  ].join('\n')
}
