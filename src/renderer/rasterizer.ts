import { Vec2, Vec3, Vec4 } from '../math/vec'
import { Mat4 } from '../math/mat'
import { ShaderPayload, FragmentShader, Triangle } from './shader'

export type { ShaderPayload, FragmentShader, Triangle }

export class Rasterizer {
  frameBuffer: Vec3[]
  depthBuffer: number[]
  private mvp!: Mat4
  private mv!: Mat4
  private normalMat!: Mat4  // (MV)^{-T}

  constructor(public width: number, public height: number) {
    this.frameBuffer = Array.from({length: width*height}, () => new Vec3(0.15,0.15,0.18))
    this.depthBuffer = new Array(width*height).fill(Infinity)
  }

  setMVP(model: Mat4, view: Mat4, proj: Mat4) {
    this.mv = view.multiply(model)
    this.mvp = proj.multiply(this.mv)
    this.normalMat = this.mv.inverse().transpose()
  }

  draw(triangles: Triangle[]) {
    const { width, height } = this
    const f1 = (100 - 0.1) / 2, f2 = (100 + 0.1) / 2  // depth range mapping

    for (const tri of triangles) {
      // MVP transform
      const vv = tri.vertices.map(v => this.mvp.mulVec4(v)) as [Vec4,Vec4,Vec4]
      // View-space positions for lighting
      const viewPos = tri.vertices.map(v => this.mv.mulVec4(v).toVec3()) as [Vec3,Vec3,Vec3]
      // Transform normals: normalMat * [nx,ny,nz,0]
      const tn = tri.normals.map(n => {
        const r = this.normalMat.mulVec4(new Vec4(n.x,n.y,n.z,0))
        return new Vec3(r.x,r.y,r.z).normalized()
      }) as [Vec3,Vec3,Vec3]

      // Perspective divide
      const v = vv.map(v4 => {
        return new Vec4(v4.x/v4.w, v4.y/v4.w, v4.z/v4.w, 1/v4.w)
      }) as [Vec4,Vec4,Vec4]

      // Viewport transform
      const screen = v.map(v4 => ({
        x: 0.5*width*(v4.x+1),
        y: 0.5*height*(v4.y+1),
        z: v4.z*f1+f2,
        invW: v4.w,  // actually 1/original_w stored in w after perspective divide
      }))

      const [s0,s1,s2] = screen
      const minX = Math.max(0, Math.floor(Math.min(s0.x,s1.x,s2.x)))
      const maxX = Math.min(width-1, Math.ceil(Math.max(s0.x,s1.x,s2.x)))
      const minY = Math.max(0, Math.floor(Math.min(s0.y,s1.y,s2.y)))
      const maxY = Math.min(height-1, Math.ceil(Math.max(s0.y,s1.y,s2.y)))

      for (let y=minY;y<=maxY;y++) for (let x=minX;x<=maxX;x++) {
        if (!insideTriangle(x+0.5, y+0.5, s0, s1, s2)) continue
        const [alpha,beta,gamma] = barycentric(x+0.5, y+0.5, s0, s1, s2)

        // Perspective-correct z
        const zInterp = alpha*s0.z + beta*s1.z + gamma*s2.z
        const idx = y*width+x
        if (zInterp >= this.depthBuffer[idx]) continue
        this.depthBuffer[idx] = zInterp

        // Perspective-correct attribute interpolation
        const wRecip = alpha*s0.invW + beta*s1.invW + gamma*s2.invW

        function pcInterp3(a0:Vec3,a1:Vec3,a2:Vec3): Vec3 {
          return a0.scale(alpha*s0.invW).add(a1.scale(beta*s1.invW)).add(a2.scale(gamma*s2.invW)).scale(1/wRecip)
        }
        function pcInterpUV(u0:Vec2,u1:Vec2,u2:Vec2): Vec2 {
          return {
            x:(u0.x*alpha*s0.invW + u1.x*beta*s1.invW + u2.x*gamma*s2.invW)/wRecip,
            y:(u0.y*alpha*s0.invW + u1.y*beta*s1.invW + u2.y*gamma*s2.invW)/wRecip,
          }
        }

        const payload: ShaderPayload = {
          normal: pcInterp3(...tn).normalized(),
          viewPos: pcInterp3(...viewPos),
          uv: pcInterpUV(...tri.uvs),
          faceId: tri.faceId,
        }
        this.frameBuffer[idx] = tri.shader(payload).clamp()
      }
    }
  }
}

type Pt = { x:number, y:number }

function cross2d(o:Pt, a:Pt, b:Pt) {
  return (a.x-o.x)*(b.y-o.y) - (a.y-o.y)*(b.x-o.x)
}

function insideTriangle(px:number, py:number, a:Pt, b:Pt, c:Pt) {
  const p={x:px,y:py}
  const d0=cross2d(a,b,p), d1=cross2d(b,c,p), d2=cross2d(c,a,p)
  return (d0>=0&&d1>=0&&d2>=0)||(d0<=0&&d1<=0&&d2<=0)
}

function barycentric(px:number, py:number, a:Pt, b:Pt, c:Pt): [number,number,number] {
  const denom = (b.y-c.y)*(a.x-c.x)+(c.x-b.x)*(a.y-c.y)
  const alpha = ((b.y-c.y)*(px-c.x)+(c.x-b.x)*(py-c.y))/denom
  const beta  = ((c.y-a.y)*(px-c.x)+(a.x-c.x)*(py-c.y))/denom
  return [alpha, beta, 1-alpha-beta]
}
