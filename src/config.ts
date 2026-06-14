import { Schema } from 'koishi'

export interface Config {
  showRenderInfo: boolean;
  enableQuote: boolean;
  showAxis: boolean;
  ambient: number;
  diffuse: number;
}

export const Config: Schema<Config> = Schema.intersect([
  Schema.object({
    showRenderInfo: Schema.boolean()
      .default(true)
      .description('📊 在骰子图片后显示渲染耗时及角度信息'),
    enableQuote: Schema.boolean()
      .default(true)
      .description('💬 开启后，所有发送的消息都会引用回复触发指令的消息'),
  }).description('💬 消息设置'),
  Schema.object({
    showAxis: Schema.boolean()
      .default(false)
      .description('📐 渲染骰子本地坐标轴（随骰子旋转）<br>' +
        '<i>❤️ X 轴：正向 (+X) → 3 点面，负向 (-X) → 4 点面</i><br>' +
        '<i>💚 Y 轴：正向 (+Y) → 2 点面，负向 (-Y) → 5 点面</i><br>' +
        '<i>💙 Z 轴：正向 (+Z) → 1 点面，负向 (-Z) → 6 点面</i>'),
    ambient: Schema.number()
      .default(0.15).min(0).max(1).step(0.01)
      .description('💡 环境光系数 k_a（[0,1]，最暗处亮度，防背光面全黑）'),
    diffuse: Schema.number()
      .default(0.85).min(0).max(1).step(0.01)
      .description('☀️ 漫反射系数 k_d（[0,1]，正对光源时增加的亮度）'),
  }).description('🎨 渲染设置'),
])
