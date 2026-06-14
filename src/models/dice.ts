import { Vec3, Vec4 } from '../math/vec'
import { Mat4 } from '../math/mat'
import { Triangle } from '../renderer/shader'
import { diceShader } from '../renderer/shader'

function face(p0:Vec3,p1:Vec3,p2:Vec3,p3:Vec3, normal:Vec3, faceId:number): Triangle[] {
  const toV4 = (v:Vec3) => Vec4.fromVec3(v)
  const n = normal.normalized()
  const ns: [Vec3,Vec3,Vec3] = [n,n,n]
  return [
    { vertices:[toV4(p0),toV4(p1),toV4(p2)], normals:ns, uvs:[{x:0,y:0},{x:1,y:0},{x:1,y:1}], faceId, shader:diceShader },
    { vertices:[toV4(p0),toV4(p2),toV4(p3)], normals:ns, uvs:[{x:0,y:0},{x:1,y:1},{x:0,y:1}], faceId, shader:diceShader },
  ]
}

export function buildDice(): Triangle[] {
  return [
    ...face(new Vec3(-.5,-.5,.5), new Vec3(.5,-.5,.5), new Vec3(.5,.5,.5), new Vec3(-.5,.5,.5), new Vec3(0,0,1), 1),
    ...face(new Vec3(.5,-.5,-.5), new Vec3(-.5,-.5,-.5), new Vec3(-.5,.5,-.5), new Vec3(.5,.5,-.5), new Vec3(0,0,-1), 6),
    ...face(new Vec3(-.5,.5,.5), new Vec3(.5,.5,.5), new Vec3(.5,.5,-.5), new Vec3(-.5,.5,-.5), new Vec3(0,1,0), 2),
    ...face(new Vec3(-.5,-.5,-.5), new Vec3(.5,-.5,-.5), new Vec3(.5,-.5,.5), new Vec3(-.5,-.5,.5), new Vec3(0,-1,0), 5),
    ...face(new Vec3(.5,-.5,.5), new Vec3(.5,-.5,-.5), new Vec3(.5,.5,-.5), new Vec3(.5,.5,.5), new Vec3(1,0,0), 3),
    ...face(new Vec3(-.5,-.5,-.5), new Vec3(-.5,-.5,.5), new Vec3(-.5,.5,.5), new Vec3(-.5,.5,-.5), new Vec3(-1,0,0), 4),
  ]
}

export function getTopFace(model: Mat4): number {
  const faces = [
    { nx: 0, ny: 0, nz: 1, value: 1 }, { nx: 0, ny: 0, nz: -1, value: 6 },
    { nx: 0, ny: 1, nz: 0, value: 2 }, { nx: 0, ny: -1, nz: 0, value: 5 },
    { nx: 1, ny: 0, nz: 0, value: 3 }, { nx: -1, ny: 0, nz: 0, value: 4 },
  ]
  const d = model.d; let top = 1, maxY = -Infinity
  for (const f of faces) {
    const ty = d[4] * f.nx + d[5] * f.ny + d[6] * f.nz
    if (ty > maxY) { maxY = ty; top = f.value }
  }
  return top
}
