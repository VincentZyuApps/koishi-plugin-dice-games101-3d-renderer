import { Context, h } from 'koishi'
import type { Config } from '../config'
import { Vec3 } from '../math/vec'
import { Mat4 } from '../math/mat'
import { Rasterizer } from '../view/rasterizer'
import { buildDice, getTopFace, getFrontFace } from '../models/dice'
import { encodePNG } from '../image/png'
import { replyWithDiceMarkdownKeyboard } from '../qq'

export function registerDiceCommand(ctx: Context, config: Config) {
  ctx.command(config.diceCommandName + ' [yaw:number] [pitch:number] [roll:number]', '渲染一个3D骰子')
    .alias('骰子')
    .usage('dice [yaw偏航] [pitch俯仰] [roll翻滚]，默认 30 20 0')
    .option('axis', '-a <show:boolean> 骰子本地坐标轴 ❤️X(+3/-4) 💚Y(+2/-5) 💙Z(+1/-6)，括号内为该轴正/负方向对应的点数（覆盖配置项）')
    .option('ambient', '--ka, --ambient <v:number> 环境光系数 k_a [0,1]（覆盖配置项）')
    .option('diffuse', '--kd, --diffuse <v:number> 漫反射系数 k_d [0,1]（覆盖配置项）')
    .option('specular', '--ks, --specular <v:number> 镜面高光系数 k_s [0,4]（覆盖配置项）')
    .option('shininess', '-p, --shininess <v:number> 高光锐度 p [1,512]（覆盖配置项）')
    .action(({ session, options }, yaw?: string, pitch?: string, roll?: string) => {
      const W = config.width, H = config.height
      const startTime = Date.now()

      // LCG 伪随机：x_{n+1} = (a·xₙ + c) mod 2³²，参数来自 Numerical Recipes
      // 用时间戳做种子，连续迭代3次得到三个独立角度
      const seed = startTime
      const lcg = (s: number) => (Math.imul(s, 1664525) + 1013904223) >>> 0
      const s1 = lcg(seed), s2 = lcg(s1), s3 = lcg(s2)
      const yw = yaw   !== undefined ? Number(yaw) : s1 % 360  // 偏航（绕 Y 轴）
      const pt = pitch !== undefined ? Number(pitch) : s2 % 360  // 俯仰（绕 X 轴）
      const rl = roll  !== undefined ? Number(roll) : s3 % 360  // 翻滚（绕 Z 轴）

      // Model 矩阵：旋转顺序 Rz·Rx·Ry（右结合，先 yaw 后 pitch 最后 roll）
      const model = Mat4.rotateZ(rl).multiply(Mat4.rotateX(pt)).multiply(Mat4.rotateY(yw))
      // View 矩阵：相机位于 (0,0,3) 看向原点，上方向为 +Y
      const view  = Mat4.lookAt(new Vec3(0,0,3), new Vec3(0,0,0), new Vec3(0,1,0))
      // Projection 矩阵：45° 视角，1:1 宽高比，near=0.1，far=100
      const proj  = Mat4.perspective(45, W/H, 0.1, 100)

      const ka = options.ambient ?? config.ambient
      const kd = options.diffuse ?? config.diffuse
      const ks = options.specular ?? config.specular
      const sh = options.shininess ?? config.shininess
      const r = new Rasterizer(W, H)
      r.setMVP(model, view, proj)
      r.draw(buildDice(ka, kd, ks, sh))

      // option 优先级高于 config（option 未传时为 undefined，?? 退回 config）
      if (options.axis ?? config.showAxis) r.drawAxes()

      // 将帧缓冲编码为 PNG，构造消息（引用 + 图片 + 可选渲染信息）
      let msg = `${config.enableQuote ? h.quote(session.messageId) : ''}${h.image(encodePNG(W, H, r.frameBuffer), 'image/png')}`
      let elapsed = 0, face = 1, angleDeg = 0
      if (config.showRenderInfo) {
        elapsed = Date.now() - startTime
        const ff = getFrontFace(model)
        face = ff.face
        angleDeg = Math.acos(Math.min(1, ff.dot)) * 180 / Math.PI
        const label = config.faceLabels.find(e => angleDeg <= e.angle) ?? config.faceLabels.at(-1)
        msg += `\n🔄渲染时间: ${elapsed}ms | 🎯 YPR: ${yw}° ${pt}° ${rl}° | 🎲 最接近面向镜头面的点数: ${face}点`
        msg += `\n📐 正对程度: ${label?.text ?? ''}（偏转 ${Math.round(angleDeg)}°）`
      }
      if (config.enableQQMarkdown) {
        const ff = getFrontFace(model)
        const ad = Math.acos(Math.min(1, ff.dot)) * 180 / Math.PI
        const lb = config.faceLabels.find(e => ad <= e.angle) ?? config.faceLabels.at(-1)
        replyWithDiceMarkdownKeyboard(session, config, {
          elapsed: Date.now() - startTime,
          yaw: yw, pitch: pt, roll: rl,
          face: ff.face, angleDeg: ad,
          label: lb?.text ?? '',
        }).catch(() => {})
      }
      return msg
    })
}
