# koishi-plugin-games101-3d-renderer 🎲

[![npm](https://img.shields.io/npm/v/koishi-plugin-games101-3d-renderer?style=flat-square)](https://www.npmjs.com/package/koishi-plugin-games101-3d-renderer)

用 TypeScript 从零手写的 3D 软件光栅化渲染器。灵感来自闫令琪老师的 GAMES101 课程。  
没有 Three.js，没有 WebGL，从矩阵到像素都是自己手算的。

---

## 🎮 快速上手

```
dice                    # 随机角度摇一次骰子
dice 30 20 10           # 指定偏航 30°、俯仰 20°、翻滚 10°
```

敲回车后插件会实时渲染一个 400×400 的 3D 骰子图片发回来，同时告诉你渲染耗时和哪面朝上。

---

## 🗺️ 坐标系：先看懂数字

```
         +Y (up)
          |     -Z (相机看的方向)
          |    /                ← 你在这儿，站在 (0, 0, 3)
          |   /
          |  /                  ← 看向原点 (0, 0, 0)
          | /
          |/__________ +X
         /
        +Z (相机背后)
```

- **摄像头** 站在 `(0, 0, 3)`，看向 `(0, 0, 0)` → 视线是 **-Z**
- **Up 方向（天线）** 是 **+Y**
- **摄像头右侧** 是 **+X**，左侧是 **-X**

记住了这个坐标系，后面所有旋转就好理解了。

---

## 🎯 Yaw / Pitch / Roll：三个角度定姿态

你用三个参数控制骰子的朝向：

```ts
// 旋转顺序：先偏航，再俯仰，最后翻滚
const model = Mat4.rotateZ(rl)
  .multiply(Mat4.rotateX(pt))
  .multiply(Mat4.rotateY(yw))
```

| 参数 | 中文 | 绕哪个轴 | 效果 |
|------|------|---------|------|
| `yaw` | 偏航 | Y 轴（上下轴） | 骰子左右转，像在转盘上 |
| `pitch` | 俯仰 | X 轴（左右轴） | 骰子前后翻，像在点头 |
| `roll` | 翻滚 | Z 轴（前后轴） | 骰子自旋，像在歪头 |

不给参数时自动用 LCG 随机生成：

```ts
const seed = Date.now()
const lcg = (s: number) => (Math.imul(s, 1664525) + 1013904223) >>> 0
const yw = yaw ?? lcg(seed) % 360
```

---

## 🎲 顶面判断：旋转后哪面朝上？

骰子有 6 个面，每个面有一个**法线**（垂直指向面外的箭头）。旋转之前：

| 法线方向 | 点数 | 备注 |
|---------|------|------|
| `(0, 0, +1)` → +Z | 1 点 | 初始朝向相机 |
| `(0, 0, -1)` → -Z | 6 点 | 背面 |
| `(0, +1, 0)` → +Y | **2 点 👑** | **朝上就是顶面** |
| `(0, -1, 0)` → -Y | 5 点 | 底面 |
| `(+1, 0, 0)` → +X | 3 点 | 右面 |
| `(-1, 0, 0)` → -X | 4 点 | 左面 |

旋转后，函数把 6 个法线都通过 model 矩阵的旋转部分转一遍，**看谁的 Y 分量最大——谁就是当前朝上的面**：

```ts
export function getTopFace(model: Mat4): number {
  const faces = [
    { nx: 0, ny: 0, nz: 1, value: 1 }, { nx: 0, ny: 0, nz: -1, value: 6 },
    { nx: 0, ny: 1, nz: 0, value: 2 }, { nx: 0, ny: -1, nz: 0, value: 5 },
    { nx: 1, ny: 0, nz: 0, value: 3 }, { nx: -1, ny: 0, nz: 0, value: 4 },
  ]
  const d = model.d
  let top = 1, maxY = -Infinity
  for (const f of faces) {
    // 矩阵第二行 (d[4]~d[6]) × 法线 → 旋转后的 Y 分量
    const ty = d[4] * f.nx + d[5] * f.ny + d[6] * f.nz
    if (ty > maxY) { maxY = ty; top = f.value }
  }
  return top
}
```

> `d[4]`, `d[5]`, `d[6]` 是 4×4 旋转矩阵的**第二行**，对应 Y 轴的变换。谁的 Y 最大，谁就朝上。

---

## ⚙️ 渲染管线：从 3D 坐标到像素

```
顶点 → MVP 变换 → 透视除法 → 视口变换 → 光栅化 → 片段着色 → PNG 编码
```

**MVP = Model × View × Projection**，三部曲：

```ts
const model = Mat4.rotateZ(rl).multiply(Mat4.rotateX(pt)).multiply(Mat4.rotateY(yw))  // 旋转骰子
const view  = Mat4.lookAt(new Vec3(0,0,3), new Vec3(0,0,0), new Vec3(0,1,0))          // 摆相机
const proj  = Mat4.perspective(45, 1, 0.1, 100)                                        // 近大远小

r.setMVP(model, view, proj)
r.draw(buildDice())
```

着色器是简单的**兰伯特漫反射 + 环境光**：

```ts
const lightDir = new Vec3(1, 1, 1).normalized()
const diff = Math.max(0, normal.dot(lightDir))
const color = baseColor * (0.15 + diff * 0.85)  // 环境光 15% + 漫反射 85%
```

骰子点用 UV 坐标判断——在圆圈范围内就涂黑，否则正常着色：

```ts
// 每个面的 UV 坐标 (0~1)，对比是否在点的圆形范围内
const dotRadius2 = 0.09 * 0.09
const isDot = (uv.x - dotCenter.x) ** 2 + (uv.y - dotCenter.y) ** 2 < dotRadius2
```

---

## 🛠️ 配置

| 配置项 | 默认 | 说明 |
|--------|------|------|
| `showRenderInfo` | `true` | 图片后显示渲染耗时、三个角度和朝上的点数 |
| `enableQuote` | `true` | 是否引用回复触发指令的消息 |

---

## 📁 项目结构

```
src/
├── index.ts                  # 插件入口
├── config.ts                 # 配置定义
├── command/
│   └── command-dice.ts       # 骰子指令
├── models/
│   └── dice.ts               # 骰子几何体 + 顶面检测
├── math/
│   ├── vec.ts                # Vec3 / Vec4 / Vec2 向量
│   └── mat.ts                # Mat4 矩阵（旋转、lookAt、透视、求逆）
├── renderer/
│   ├── rasterizer.ts         # 光栅化器（包围盒、重心插值、Z-buffer）
│   └── shader.ts             # 片段着色器
├── image/
│   └── png.ts                # 纯手写 PNG 编码器（无外部依赖）
```

---

## 📦 无外部图形依赖

整个渲染器不依赖任何图形库。从头到尾全部手写：

| 模块 | 手写了什么 |
|------|-----------|
| `math/` | `Float64Array` 矩阵乘法、行主序 4×4 逆矩阵（代数余子式展开）、lookAt、透视投影 |
| `renderer/` | 包围盒遍历、叉积三角形内检测、透视校正重心插值、Z-buffer 深度测试 |
| `image/` | PNG 签名、IHDR/IDAT/IEND 块、zlib 压缩、CRC-32 |

唯一的外部依赖是 Node.js 内置的 `zlib`（用于 PNG 压缩）和 Koishi 本体。

---

## 📚 参考

- [GAMES101 课程主页](https://sites.cs.ucsb.edu/~lingqi/teaching/games101.html)
- [闫令琪老师 B 站课程](https://www.bilibili.com/video/BV1X7411F744)
