import { Schema } from 'koishi'
import { stringifyCompact, DEFAULT_KEYBOARD_ROWS } from './qq'

export interface Config {
  // --- 📝 指令名设置 ---
  diceCommandName: string;
  // --- 💬 消息设置 ---
  showRenderInfo: boolean;
  faceLabels: { angle: number; text: string }[];
  enableQuote: boolean;
  // --- 🎨 渲染设置 ---
  showAxis: boolean;
  width: number;
  height: number;
  ambient: number;
  diffuse: number;
  specular: number;
  shininess: number;
  // --- 🤖 QQ 官方 Bot 平台设置 ---
  enableQQMarkdown: boolean;
  qqMarkdownKeyboardJson: string;
}

export const Config: Schema<Config> = Schema.intersect([
  // --- 📝 指令名设置 ---
  Schema.object({
    diceCommandName: Schema.string()
      .default('dice')
      .description('🎲 dice 指令名称'),
  }).description('📝 指令名设置'),

  // --- 💬 消息设置 ---
  Schema.object({
    showRenderInfo: Schema.boolean()
      .default(true)
      .description('📊⏱️🎲 在骰子图片后显示一些渲染信息 <br> line1: 渲染耗时、角度信息、以及最接近面向镜头面的点数 <br> line2: 对于正对镜头程度的评价'),
    faceLabels: Schema.array(Schema.object({
      angle: Schema.number().required().description('角度上限（°）'),
      text: Schema.string().required().description('评价文案'),
    })).role('table')
      .default([
        { angle: 10, text: '非常正对！' },
        { angle: 20, text: '还挺正的' },
        { angle: 30, text: '有点歪，不过还行' },
        { angle: 40, text: '歪的有点多了' },
        { angle: 45, text: '歪到姥姥家了' },
      ])
      .description('🎯📐 正对镜头评价表（按角度升序排列，取第一个满足 θ ≤ angle 的文案）'),
    enableQuote: Schema.boolean()
      .default(true)
      .description('💬↩️ 开启后，所有发送的消息都会引用回复触发指令的消息'),
  }).description('💬 消息设置'),

  // --- 🎨 渲染设置 ---
  Schema.object({
    showAxis: Schema.boolean()
      .default(false)
      .description('📐🧭 渲染骰子本地坐标轴（随骰子旋转）<br>' +
        '<i>❤️ X 轴：正向 (+X) → 3 点面，负向 (-X) → 4 点面</i><br>' +
        '<i>💚 Y 轴：正向 (+Y) → 2 点面，负向 (-Y) → 5 点面</i><br>' +
        '<i>💙 Z 轴：正向 (+Z) → 1 点面，负向 (-Z) → 6 点面</i>'),
    width: Schema.number()
      .default(400).min(100).max(1000).step(50)
      .description('🖼️↔️ 渲染图片宽度（像素，100-1000）'),
    height: Schema.number()
      .default(400).min(100).max(1000).step(50)
      .description('🖼️↕️ 渲染图片高度（像素，100-1000）'),
    ambient: Schema.number()
      .default(0.15).min(0).max(1).step(0.01)
      .description('💡🌑 环境光系数 k_a 范围是[0,1]<br>' +
        '🔗 <u><a href="https://en.wikipedia.org/wiki/Lambertian_reflectance" target="_blank">Johann Heinrich Lambert · 1760</a></u><br>' +
        '<i>🔼 调大 → 暗面变亮，整体对比度降低，画面偏"平"</i><br>' +
        '<i>🔽 调小 → 暗面更黑，明暗对比更强烈，画面更立体</i>'),
    diffuse: Schema.number()
      .default(0.85).min(0).max(1).step(0.01)
      .description('☀️🎨 漫反射系数 k_d 范围是[0,1]<br>' +
        '🔗 <u><a href="https://en.wikipedia.org/wiki/Lambertian_reflectance" target="_blank">Johann Heinrich Lambert · 1760</a></u><br>' +
        '<i>🔼 调大 → 正对光源的面更亮（需配合 k_a，总和不超 1 避免被 clamp 截断）</i><br>' +
        '<i>🔽 调小 → 亮面变暗，物体整体偏灰</i>'),
    specular: Schema.number()
      .default(0.6).min(0).max(4).step(0.05)
      .description('✨💫 镜面高光系数 k_s 范围是[0,4]<br>' +
        '🔗 <u><a href="https://en.wikipedia.org/wiki/Blinn%E2%80%93Phong_reflection_model" target="_blank">James F. Blinn · 1977</a></u><br>' +
        '<i>🔼 调大 → 反光斑更亮更显眼，"手电筒"感更强</i><br>' +
        '<i>🔽 调小 → 高光减弱，设为 0 回退到纯 Lambert 效果</i>'),
    shininess: Schema.number()
      .default(32).min(1).max(512).step(1)
      .description('🔦🔆 高光锐度 p 范围是[1,512]<br>' +
        '🔗 <u><a href="https://en.wikipedia.org/wiki/Blinn%E2%80%93Phong_reflection_model" target="_blank">James F. Blinn · 1977</a></u><br>' +
        '<i>🔼 调大 → 光斑小而集中（像手电筒聚焦光束）</i><br>' +
        '<i>🔽 调小 → 光斑大而柔和（像柔光灯箱）</i>'),
  }).description('🎨 渲染设置'),

  // --- 🤖 QQ 官方 Bot 平台设置 ---
  Schema.object({
    enableQQMarkdown: Schema.boolean()
      .default(true)
      .description('💬 在 QQ 官方 Bot 平台发送图片时附带 Markdown + 按钮消息'),
    qqMarkdownKeyboardJson: Schema.string()
      .role('textarea', { rows: [5, 10] })
      .default(stringifyCompact(DEFAULT_KEYBOARD_ROWS))
      .description(
        '📋 QQ Markdown 按钮 JSON 配置<br><em>支持变量: <code>${diceCommandName}</code> <code>${userId}</code></em>',
      ),
  }).description('🤖 QQ 官方 Bot 平台设置'),
])
