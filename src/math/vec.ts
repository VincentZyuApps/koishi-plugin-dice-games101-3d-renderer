export type Vec2 = { x: number; y: number }

export class Vec3 {
  constructor(public x = 0, public y = 0, public z = 0) {}
  add(v: Vec3) { return new Vec3(this.x+v.x, this.y+v.y, this.z+v.z) }
  sub(v: Vec3) { return new Vec3(this.x-v.x, this.y-v.y, this.z-v.z) }
  scale(s: number) { return new Vec3(this.x*s, this.y*s, this.z*s) }
  dot(v: Vec3) { return this.x*v.x + this.y*v.y + this.z*v.z }
  cross(v: Vec3) {
    return new Vec3(
      this.y*v.z - this.z*v.y,
      this.z*v.x - this.x*v.z,
      this.x*v.y - this.y*v.x,
    )
  }
  norm() { return Math.sqrt(this.dot(this)) }
  normalized() { const n = this.norm(); return n > 0 ? this.scale(1/n) : new Vec3() }
  cwiseProduct(v: Vec3) { return new Vec3(this.x*v.x, this.y*v.y, this.z*v.z) }
  clamp(lo = 0, hi = 1) { return new Vec3(Math.min(hi,Math.max(lo,this.x)), Math.min(hi,Math.max(lo,this.y)), Math.min(hi,Math.max(lo,this.z))) }
}

export class Vec4 {
  constructor(public x = 0, public y = 0, public z = 0, public w = 1) {}
  toVec3() { return new Vec3(this.x, this.y, this.z) }
  static fromVec3(v: Vec3, w = 1) { return new Vec4(v.x, v.y, v.z, w) }
}
