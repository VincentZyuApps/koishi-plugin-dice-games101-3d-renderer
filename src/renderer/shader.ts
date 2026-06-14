import { Vec2, Vec3 } from '../math/vec'
import { Vec4 } from '../math/vec'

export interface ShaderPayload {
  normal: Vec3
  viewPos: Vec3
  uv: Vec2
  faceId: number
}

export type FragmentShader = (p: ShaderPayload) => Vec3

export interface Triangle {
  vertices: [Vec4, Vec4, Vec4]
  normals:  [Vec3, Vec3, Vec3]
  uvs:      [Vec2, Vec2, Vec2]
  faceId:   number
  shader:   FragmentShader
}

const DOT_PATTERNS: Record<number, Vec2[]> = {
  1: [{x:.5,y:.5}],
  2: [{x:.25,y:.75},{x:.75,y:.25}],
  3: [{x:.25,y:.75},{x:.5,y:.5},{x:.75,y:.25}],
  4: [{x:.25,y:.25},{x:.75,y:.25},{x:.25,y:.75},{x:.75,y:.75}],
  5: [{x:.25,y:.25},{x:.75,y:.25},{x:.5,y:.5},{x:.25,y:.75},{x:.75,y:.75}],
  6: [{x:.25,y:.2},{x:.75,y:.2},{x:.25,y:.5},{x:.75,y:.5},{x:.25,y:.8},{x:.75,y:.8}],
}

const LIGHT_DIR = new Vec3(1,1,1).normalized()
const AMBIENT = 0.15
const R2 = 0.09 * 0.09

export const diceShader: FragmentShader = (p) => {
  for (const c of DOT_PATTERNS[p.faceId]) {
    const dx=p.uv.x-c.x, dy=p.uv.y-c.y
    if (dx*dx+dy*dy < R2) return new Vec3(0.05,0.05,0.05)
  }
  const lit = AMBIENT + (1-AMBIENT) * Math.max(0, p.normal.dot(LIGHT_DIR))
  return new Vec3(lit, lit, lit)
}
