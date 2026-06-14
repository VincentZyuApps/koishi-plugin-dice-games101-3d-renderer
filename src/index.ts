import { Context } from 'koishi'
import { Config } from './config'
import { registerDiceCommand } from './command/command-dice'

export const name = 'games101-3d-renderer'

export { Config }

export function apply(ctx: Context, config: Config) {
  registerDiceCommand(ctx, config)
}
