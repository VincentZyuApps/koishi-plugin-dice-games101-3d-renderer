import { h } from 'koishi'
import { buildDiceMarkdown } from './markdown/md'
import type { MarkdownContext, StepKey } from './markdown/types';

export const DEFAULT_KEYBOARD_ROWS = {
  rows: [
    {
      buttons: [
        {
          render_data: { label: '🎲 再试一次', style: 1 },
          action: {
            type: 2,
            permission: { type: 2 },
            data: '${diceCommandName}',
            enter: true,
          },
        },
        {
          render_data: { label: '❓ 获取帮助', style: 1 },
          action: {
            type: 2,
            permission: { type: 2 },
            data: '${diceCommandName} --help',
            enter: true,
          },
        },
      ],
    },
  ],
};

export function buildDiceKeyboard(
  cmds: { diceCommandName: string },
  userId: string,
  customJson?: string,
): object {
  let raw: string;
  if (customJson) {
    raw = customJson;
  } else {
    raw = JSON.stringify(DEFAULT_KEYBOARD_ROWS);
  }
  try {
    raw = raw.replace(/\$\{diceCommandName\}/g, cmds.diceCommandName);
    raw = raw.replace(/\$\{userId\}/g, userId);
    const parsed = JSON.parse(raw);
    if (parsed?.rows?.length) return parsed;
  } catch {}
  return DEFAULT_KEYBOARD_ROWS;
}

export interface DiceRenderInfo extends MarkdownContext {
  label?: string
}

export { buildDiceMarkdown } from './markdown/md'

export async function sendQQMarkdown(
  session: any,
  markdown: string,
  keyboard: object,
): Promise<void> {
  if (!['qq', 'qqguild'].includes(session.platform)) return;
  try {
    const internal = (session.bot as any)?.internal;

    if (internal) {
      const payload: Record<string, unknown> = {
        msg_type: 2,
        markdown: { content: markdown },
      };
      if ((keyboard as any)?.rows?.length) {
        payload.keyboard = { content: keyboard };
      }

      if (
        session.messageId &&
        session.timestamp &&
        Date.now() - session.timestamp < 5 * 60 * 1000 - 2000
      ) {
        session.seq ||= 0;
        payload.msg_id = session.messageId;
        payload.msg_seq = ++session.seq;
      }

      if (session.isDirect) {
        const targetId = session.guildId || session.channelId || session.userId;
        await internal.sendPrivateMessage(targetId, payload);
      } else {
        await internal.sendMessage(session.channelId, payload);
      }
      return;
    }

    // 兜底降级：在无 internal 场景下走元素发送
    const fallbackPayload: Record<string, unknown> = {
      markdown: { content: markdown },
    };
    if ((keyboard as any)?.rows?.length) {
      fallbackPayload.keyboard = { content: keyboard };
    }
    await session.send(h('qq:rawmarkdown', fallbackPayload));
  } catch (e) {
    console.warn('⚠️💬 [QQ Markdown] 发送失败, 不影响图片:', (e as Error)?.message || e);
  }
}

export async function replyWithDiceMarkdownKeyboard(
  session: any,
  config: {
    enableQQMarkdown: boolean
    qqMarkdownKeyboardJson: string
    diceCommandName: string
    diceMarkdownSteps: StepKey[]
  },
  info: DiceRenderInfo,
): Promise<void> {
  if (
    !config.enableQQMarkdown ||
    !['qq', 'qqguild'].includes(session.platform)
  ) {
    return
  }

  const md = buildDiceMarkdown(info, config.diceMarkdownSteps, info.label)
  const kb = buildDiceKeyboard(
    { diceCommandName: config.diceCommandName },
    session.userId,
    config.qqMarkdownKeyboardJson,
  );
  await sendQQMarkdown(session, md, kb);
}

export function stringifyCompact(obj: any): string {
  const rows = obj.rows;
  let result = '{\n';
  result += '  "rows": [\n';
  for (let ri = 0; ri < rows.length; ri++) {
    const buttons = rows[ri].buttons.map(
      (b: any) => '        ' + JSON.stringify(b),
    );
    result += '    {\n';
    result += '      "buttons": [\n';
    result += buttons.join(',\n');
    result += '\n      ]\n';
    result += '    }' + (ri < rows.length - 1 ? ',' : '') + '\n';
  }
  result += '  ]\n';
  result += '}';
  return result;
}
