import { Schema } from 'koishi'

export interface Config {
  showRenderInfo: boolean;
  enableQuote: boolean;
}

export const Config: Schema<Config> = Schema.object({
  showRenderInfo: Schema.boolean()
    .default(true)
    .description('📊 在骰子图片后显示渲染耗时及角度信息'),
  enableQuote: Schema.boolean()
    .default(true)
    .description('💬 开启后，所有发送的消息都会引用回复触发指令的消息'),
})
