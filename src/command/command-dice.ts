import { Context, h } from 'koishi'
import type { Config } from '../config'
import { Vec3 } from '../math/vec'
import { Mat4 } from '../math/mat'
import { Rasterizer } from '../renderer/rasterizer'
import { buildDice, getTopFace } from '../models/dice'
import { encodePNG } from '../image/png'


export function registerDiceCommand(ctx: Context, config: Config) {
  ctx.command('dice [yaw:number] [pitch:number] [roll:number]', '渲染一个3D骰子')
    .alias('骰子')
    .usage('dice [yaw偏航] [pitch俯仰] [roll翻滚]，默认 30 20 0')
    .action(({ session }, yaw?: number, pitch?: number, roll?: number) => {
      const W = 400, H = 400
      const startTime = Date.now()
      const seed = startTime
      const lcg = (s: number) => (Math.imul(s, 1664525) + 1013904223) >>> 0
      const s1 = lcg(seed), s2 = lcg(s1), s3 = lcg(s2)
      const yw = yaw ?? s1 % 360
      const pt = pitch ?? s2 % 360
      const rl = roll ?? s3 % 360
      const r = new Rasterizer(W, H)
      const model = Mat4.rotateZ(rl).multiply(Mat4.rotateX(pt)).multiply(Mat4.rotateY(yw))
      const view = Mat4.lookAt(new Vec3(0,0,3), new Vec3(0,0,0), new Vec3(0,1,0))
      const proj = Mat4.perspective(45, W/H, 0.1, 100)
      r.setMVP(model, view, proj)
      r.draw(buildDice())

      let msg = `${config.enableQuote ? h.quote(session.messageId) : ''}${h.image(encodePNG(W, H, r.frameBuffer), 'image/png')}`
      if (config.showRenderInfo) {
        const elapsed = Date.now() - startTime
        const topFace = getTopFace(model)
        msg += `\n🔄 ${elapsed}ms | 🎯 ${yw}° ${pt}° ${rl}° | 🎲 ${topFace}点朝上`
      }
      return msg
    })
}
