import type { MarkdownContext } from './types'

export const key = '5-mvp-transform' as const
export const title = 'MVP 顶点变换示例'

export function render(ctx: MarkdownContext): string {
  // Pick a sample vertex: one corner of the dice cube
  const rad = (d: number) => d * Math.PI / 180
  const cy = Math.cos(rad(ctx.yaw)), sy = Math.sin(rad(ctx.yaw))
  const cp = Math.cos(rad(ctx.pitch)), sp = Math.sin(rad(ctx.pitch))
  const cr = Math.cos(rad(ctx.roll)), sr = Math.sin(rad(ctx.roll))

  // Model matrix entries (Rz * Rx * Ry)
  const m00 = cy * cr - sr * sp * sy,
    m01 = -sr * cp,
    m02 = cr * sy + sr * sp * cy
  const m10 = sr * cy + cr * sp * sy,
    m11 = cr * cp,
    m12 = sr * sy - cr * sp * cy
  const m20 = -cp * sy,
    m21 = sp,
    m22 = cp * cy

  // M·v then V·(M·v)
  const vx = 0.5,
    vy = 0.5,
    vz = 0.5
  const mx = m00 * vx + m01 * vy + m02 * vz
  const my = m10 * vx + m11 * vy + m12 * vz
  const mz = m20 * vx + m21 * vy + m22 * vz
  const viewX = mx,
    viewY = my,
    viewZ = mz - 3

  // Perspective
  const fovRad = ctx.fov * Math.PI / 360
  const t = ctx.near * Math.tan(fovRad)
  const r = t * (ctx.width / ctx.height)
  const n_r = ctx.near / r,
    n_t = ctx.near / t
  const p22 = -(ctx.far + ctx.near) / (ctx.far - ctx.near)
  const p23 = (-2 * ctx.far * ctx.near) / (ctx.far - ctx.near)

  const clipX = n_r * viewX
  const clipY = n_t * viewY
  const clipZ = p22 * viewZ + p23
  const clipW = -viewZ

  const ndcX = clipX / clipW
  const ndcY = clipY / clipW
  const ndcZ = clipZ / clipW
  const F = (v: number) => v.toFixed(3)

  return [
    '### [5] 📐 MVP 变换',
    '',
    '$$ \\vec{v}_{\\text{model}} = (0.5, 0.5, 0.5) $$',
    '',
    String.raw`$$ M \cdot \vec{v} = (${F(mx)}, ${F(my)}, ${F(mz)}) $$`,
    '',
    String.raw`$$ V \cdot (M \cdot \vec{v}) = (${F(viewX)}, ${F(viewY)}, ${F(viewZ)}) $$`,
    '',
    String.raw`$$ P \cdot \vec{v}_{\text{view}} = (${F(clipX)}, ${F(clipY)}, ${F(clipZ)}, ${F(clipW)}) $$`,
    '',
    String.raw`$$ \vec{v}_{\text{ndc}} = (${F(ndcX)}, ${F(ndcY)}, ${F(ndcZ)}) $$`,
    '',
    '> 示例顶点 (0.5, 0.5, 0.5) 依次经过 Model → View → Perspective → 透视除法，最终到达 NDC。',
  ].join('\n')
}
