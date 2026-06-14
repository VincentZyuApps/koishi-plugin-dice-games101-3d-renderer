import { Vec3, Vec4 } from '../math/vec'
import { Mat4 } from '../math/mat'
import { Triangle } from '../view/shader'
import { diceShader, makeDiceShader } from '../view/shader'

/**
 * 将一个四边形面（两个三角形）加入三角形列表。
 *
 * 为什么拆成两个三角形？GPU/软光栅化只处理三角形（最简凸多边形，永远共面），
 * 四边形必须先 triangulate。拆分方式：沿对角线 p0→p2 切割。
 *
 * 顶点顺序：p0→p1→p2→p3 逆时针（从法线正方向看），叉积得到正外法线。
 *
 * UV 布局（两个三角形拼成完整的 [0,1]² 矩形）：
 *   p0(0,0) ─── p1(1,0)      UV 原点(0,0)在左下，(1,1)在右上。
 *      │    ╲    │            三角形1：p0 p1 p2（左下+右下+右上）
 *   p3(0,1) ─── p2(1,1)      三角形2：p0 p2 p3（左下+右上+左上）
 */
function face(p0:Vec3,p1:Vec3,p2:Vec3,p3:Vec3, normal:Vec3, faceId:number, shader = diceShader): Triangle[] {
  const toV4 = (v:Vec3) => Vec4.fromVec3(v)
  const n = normal.normalized()
  const ns: [Vec3,Vec3,Vec3] = [n,n,n]  // flat shading：三顶点共享同一法线（骰子面完全平）
  return [
    { vertices:[toV4(p0),toV4(p1),toV4(p2)], normals:ns, uvs:[{x:0,y:0},{x:1,y:0},{x:1,y:1}], faceId, shader },
    { vertices:[toV4(p0),toV4(p2),toV4(p3)], normals:ns, uvs:[{x:0,y:0},{x:1,y:1},{x:0,y:1}], faceId, shader },
  ]
}

/**
 * 构建骰子几何体：单位立方体（顶点范围 [-0.5, 0.5]³），12个三角形（6面×2）。
 * 轴色对照（--axis）：❤️ +X=3/-X=4 | 💚 +Y=2/-Y=5 | 💙 +Z=1/-Z=6
 * 标准骰子对面之和为7（1对6，2对5，3对4）。
 */
export function buildDice(ambient = 0.15, diffuse = 0.85, specular = 0.6, shininess = 32): Triangle[] {
  const shader = (ambient === 0.15 && diffuse === 0.85 && specular === 0.6 && shininess === 32)
    ? diceShader : makeDiceShader(ambient, diffuse, specular, shininess)
  const f = (...args: Parameters<typeof face>) => face(...args)
  return [
    ...f(new Vec3(-.5,-.5,.5), new Vec3(.5,-.5,.5), new Vec3(.5,.5,.5), new Vec3(-.5,.5,.5), new Vec3(0,0,1), 1, shader),   // +Z = 1点
    ...f(new Vec3(.5,-.5,-.5), new Vec3(-.5,-.5,-.5), new Vec3(-.5,.5,-.5), new Vec3(.5,.5,-.5), new Vec3(0,0,-1), 6, shader), // -Z = 6点
    ...f(new Vec3(-.5,.5,.5), new Vec3(.5,.5,.5), new Vec3(.5,.5,-.5), new Vec3(-.5,.5,-.5), new Vec3(0,1,0), 2, shader),   // +Y = 2点
    ...f(new Vec3(-.5,-.5,-.5), new Vec3(.5,-.5,-.5), new Vec3(.5,-.5,.5), new Vec3(-.5,-.5,.5), new Vec3(0,-1,0), 5, shader), // -Y = 5点
    ...f(new Vec3(.5,-.5,.5), new Vec3(.5,-.5,-.5), new Vec3(.5,.5,-.5), new Vec3(.5,.5,.5), new Vec3(1,0,0), 3, shader),   // +X = 3点
    ...f(new Vec3(-.5,-.5,-.5), new Vec3(-.5,-.5,.5), new Vec3(-.5,.5,.5), new Vec3(-.5,.5,-.5), new Vec3(-1,0,0), 4, shader), // -X = 4点
  ]
}

/**
 * 判断旋转后骰子哪一面最朝向镜头（相机在世界 +Z 方向）。
 * 原理：各面初始法线经 Model 矩阵变换后，Z 分量最大的面即最朝相机。
 *   rotated_n_z = d[8]·nx + d[9]·ny + d[10]·nz
 * 其中 d[8..10] 是行主序矩阵的第3行（世界空间 Z 轴方向）。
 */
export function getFrontFace(model: Mat4): { face: number; dot: number } {
  const faces = [
    { nx: 0, ny: 0, nz: 1, value: 1 }, { nx: 0, ny: 0, nz: -1, value: 6 },
    { nx: 0, ny: 1, nz: 0, value: 2 }, { nx: 0, ny: -1, nz: 0, value: 5 },
    { nx: 1, ny: 0, nz: 0, value: 3 }, { nx: -1, ny: 0, nz: 0, value: 4 },
  ]
  const d = model.d; let front = 1, dot = -Infinity
  for (const f of faces) {
    const tz = d[8] * f.nx + d[9] * f.ny + d[10] * f.nz
    if (tz > dot) { dot = tz; front = f.value }
  }
  return { face: front, dot }
}

/**
 * 判断旋转后骰子哪一面朝上（世界 +Y 方向）。
 * rotated_n_y = d[4]·nx + d[5]·ny + d[6]·nz（矩阵第2行）。
 */
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
