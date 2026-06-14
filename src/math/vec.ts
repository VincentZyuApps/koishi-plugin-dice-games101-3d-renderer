/** 二维向量（主要用于 UV 贴图坐标，u∈[0,1] v∈[0,1]）。 */
export type Vec2 = { x: number; y: number }

/** 三维欧几里得向量。所有运算均返回新实例（不可变风格），不修改 this。 */
export class Vec3 {
  constructor(public x = 0, public y = 0, public z = 0) {}

  add(v: Vec3) { return new Vec3(this.x+v.x, this.y+v.y, this.z+v.z) }
  sub(v: Vec3) { return new Vec3(this.x-v.x, this.y-v.y, this.z-v.z) }

  /** 数乘：向量缩放。 */
  scale(s: number) { return new Vec3(this.x*s, this.y*s, this.z*s) }

  /** 点积（内积）：a·b = |a||b|cos θ，结果为标量。用于光照角度计算。 */
  dot(v: Vec3) { return this.x*v.x + this.y*v.y + this.z*v.z }

  /**
   * 叉积（外积）：结果向量垂直于 this 和 v，遵循右手定则，模 = |a||b|sin θ。
   *   ┌ i   j   k  ┐
   *   │ ax  ay  az │ = (ay·bz−az·by,  az·bx−ax·bz,  ax·by−ay·bx)
   *   └ bx  by  bz ┘
   * 用于：构建相机正交基（lookAt）、法线计算、三角形方向判断。
   */
  cross(v: Vec3) {
    return new Vec3(
      this.y*v.z - this.z*v.y,
      this.z*v.x - this.x*v.z,
      this.x*v.y - this.y*v.x,
    )
  }

  /** 欧几里得范数（模长）：√(x²+y²+z²)。 */
  norm() { return Math.sqrt(this.dot(this)) }

  /** 归一化：返回同方向的单位向量。零向量返回零向量。 */
  normalized() { const n = this.norm(); return n > 0 ? this.scale(1/n) : new Vec3() }

  /** 分量乘积（Hadamard 积）：用于颜色混合等逐分量运算。 */
  cwiseProduct(v: Vec3) { return new Vec3(this.x*v.x, this.y*v.y, this.z*v.z) }

  /** 将各分量 clamp 到 [lo, hi]，默认 [0, 1]（用于颜色写入帧缓冲前）。 */
  clamp(lo = 0, hi = 1) { return new Vec3(Math.min(hi,Math.max(lo,this.x)), Math.min(hi,Math.max(lo,this.y)), Math.min(hi,Math.max(lo,this.z))) }
}

/** 四维齐次向量。w=1 表示点，w=0 表示方向向量（不受平移影响）。 */
export class Vec4 {
  constructor(public x = 0, public y = 0, public z = 0, public w = 1) {}

  /** 丢弃 w 分量，得到对应的三维向量。 */
  toVec3() { return new Vec3(this.x, this.y, this.z) }
  static fromVec3(v: Vec3, w = 1) { return new Vec4(v.x, v.y, v.z, w) }
}
