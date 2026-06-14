import { Vec3, Vec4 } from './vec'

// Row-major 4x4 matrix
export class Mat4 {
  constructor(public d = new Float64Array(16)) {}

  static identity(): Mat4 {
    const m = new Mat4()
    m.d[0]=m.d[5]=m.d[10]=m.d[15]=1
    return m
  }

  static fromRows(rows: number[][]): Mat4 {
    const m = new Mat4()
    for (let r=0;r<4;r++) for (let c=0;c<4;c++) m.d[r*4+c]=rows[r][c]
    return m
  }

  multiply(b: Mat4): Mat4 {
    const m = new Mat4()
    for (let r=0;r<4;r++) for (let c=0;c<4;c++) {
      let s=0; for (let k=0;k<4;k++) s+=this.d[r*4+k]*b.d[k*4+c]
      m.d[r*4+c]=s
    }
    return m
  }

  mulVec4(v: Vec4): Vec4 {
    const d=this.d, x=v.x,y=v.y,z=v.z,w=v.w
    return new Vec4(
      d[0]*x+d[1]*y+d[2]*z+d[3]*w,
      d[4]*x+d[5]*y+d[6]*z+d[7]*w,
      d[8]*x+d[9]*y+d[10]*z+d[11]*w,
      d[12]*x+d[13]*y+d[14]*z+d[15]*w,
    )
  }

  transpose(): Mat4 {
    const m = new Mat4()
    for (let r=0;r<4;r++) for (let c=0;c<4;c++) m.d[r*4+c]=this.d[c*4+r]
    return m
  }

  // Inverse via cofactor expansion
  inverse(): Mat4 {
    const m=this.d, inv=new Float64Array(16)
    inv[0] = m[5]*m[10]*m[15]-m[5]*m[11]*m[14]-m[9]*m[6]*m[15]+m[9]*m[7]*m[14]+m[13]*m[6]*m[11]-m[13]*m[7]*m[10]
    inv[4] = -m[4]*m[10]*m[15]+m[4]*m[11]*m[14]+m[8]*m[6]*m[15]-m[8]*m[7]*m[14]-m[12]*m[6]*m[11]+m[12]*m[7]*m[10]
    inv[8] = m[4]*m[9]*m[15]-m[4]*m[11]*m[13]-m[8]*m[5]*m[15]+m[8]*m[7]*m[13]+m[12]*m[5]*m[11]-m[12]*m[7]*m[9]
    inv[12]= -m[4]*m[9]*m[14]+m[4]*m[10]*m[13]+m[8]*m[5]*m[14]-m[8]*m[6]*m[13]-m[12]*m[5]*m[10]+m[12]*m[6]*m[9]
    inv[1] = -m[1]*m[10]*m[15]+m[1]*m[11]*m[14]+m[9]*m[2]*m[15]-m[9]*m[3]*m[14]-m[13]*m[2]*m[11]+m[13]*m[3]*m[10]
    inv[5] = m[0]*m[10]*m[15]-m[0]*m[11]*m[14]-m[8]*m[2]*m[15]+m[8]*m[3]*m[14]+m[12]*m[2]*m[11]-m[12]*m[3]*m[10]
    inv[9] = -m[0]*m[9]*m[15]+m[0]*m[11]*m[13]+m[8]*m[1]*m[15]-m[8]*m[3]*m[13]-m[12]*m[1]*m[11]+m[12]*m[3]*m[9]
    inv[13]= m[0]*m[9]*m[14]-m[0]*m[10]*m[13]-m[8]*m[1]*m[14]+m[8]*m[2]*m[13]+m[12]*m[1]*m[10]-m[12]*m[2]*m[9]
    inv[2] = m[1]*m[6]*m[15]-m[1]*m[7]*m[14]-m[5]*m[2]*m[15]+m[5]*m[3]*m[14]+m[13]*m[2]*m[7]-m[13]*m[3]*m[6]
    inv[6] = -m[0]*m[6]*m[15]+m[0]*m[7]*m[14]+m[4]*m[2]*m[15]-m[4]*m[3]*m[14]-m[12]*m[2]*m[7]+m[12]*m[3]*m[6]
    inv[10]= m[0]*m[5]*m[15]-m[0]*m[7]*m[13]-m[4]*m[1]*m[15]+m[4]*m[3]*m[13]+m[12]*m[1]*m[7]-m[12]*m[3]*m[5]
    inv[14]= -m[0]*m[5]*m[14]+m[0]*m[6]*m[13]+m[4]*m[1]*m[14]-m[4]*m[2]*m[13]-m[12]*m[1]*m[6]+m[12]*m[2]*m[5]
    inv[3] = -m[1]*m[6]*m[11]+m[1]*m[7]*m[10]+m[5]*m[2]*m[11]-m[5]*m[3]*m[10]-m[9]*m[2]*m[7]+m[9]*m[3]*m[6]
    inv[7] = m[0]*m[6]*m[11]-m[0]*m[7]*m[10]-m[4]*m[2]*m[11]+m[4]*m[3]*m[10]+m[8]*m[2]*m[7]-m[8]*m[3]*m[6]
    inv[11]= -m[0]*m[5]*m[11]+m[0]*m[7]*m[9]+m[4]*m[1]*m[11]-m[4]*m[3]*m[9]-m[8]*m[1]*m[7]+m[8]*m[3]*m[5]
    inv[15]= m[0]*m[5]*m[10]-m[0]*m[6]*m[9]-m[4]*m[1]*m[10]+m[4]*m[2]*m[9]+m[8]*m[1]*m[6]-m[8]*m[2]*m[5]
    const det = m[0]*inv[0]+m[1]*inv[4]+m[2]*inv[8]+m[3]*inv[12]
    if (Math.abs(det)<1e-12) return Mat4.identity()
    const r = new Mat4()
    for (let i=0;i<16;i++) r.d[i]=inv[i]/det
    return r
  }

  // Model matrix: rotate around Y axis (degrees)
  static rotateY(deg: number): Mat4 {
    const r=deg*Math.PI/180, c=Math.cos(r), s=Math.sin(r)
    return Mat4.fromRows([[c,0,s,0],[0,1,0,0],[-s,0,c,0],[0,0,0,1]])
  }

  static rotateX(deg: number): Mat4 {
    const r=deg*Math.PI/180, c=Math.cos(r), s=Math.sin(r)
    return Mat4.fromRows([[1,0,0,0],[0,c,-s,0],[0,s,c,0],[0,0,0,1]])
  }

  static rotateZ(deg: number): Mat4 {
    const r=deg*Math.PI/180, c=Math.cos(r), s=Math.sin(r)
    return Mat4.fromRows([[c,-s,0,0],[s,c,0,0],[0,0,1,0],[0,0,0,1]])
  }

  // View matrix: look from eye toward origin
  static lookAt(eye: Vec3, center: Vec3, up: Vec3): Mat4 {
    const f=center.sub(eye).normalized()
    const r=f.cross(up).normalized()
    const u=r.cross(f)
    return Mat4.fromRows([
      [r.x,r.y,r.z,-r.dot(eye)],
      [u.x,u.y,u.z,-u.dot(eye)],
      [-f.x,-f.y,-f.z,f.dot(eye)],
      [0,0,0,1],
    ])
  }

  // Perspective projection
  static perspective(fovY: number, aspect: number, near: number, far: number): Mat4 {
    const t=Math.tan(fovY*Math.PI/360)*near, r=t*aspect
    return Mat4.fromRows([
      [near/r,0,0,0],
      [0,near/t,0,0],
      [0,0,-(far+near)/(far-near),-2*far*near/(far-near)],
      [0,0,-1,0],
    ])
  }
}
