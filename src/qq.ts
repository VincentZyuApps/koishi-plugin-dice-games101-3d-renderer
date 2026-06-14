import { h } from 'koishi';

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

export interface DiceRenderInfo {
  elapsed: number;
  yaw: number;
  pitch: number;
  roll: number;
  face: number;
  angleDeg: number;
  label?: string;
}

export function buildDiceMarkdown(info: DiceRenderInfo): string {
  return [
    '# 🎲 骰子渲染结果',
    '',
    `> 好玩不awa`,
    '',
    '---',
    '',
  ].join('\n');
}

export async function sendQQMarkdown(
  session: any,
  markdown: string,
  keyboard: object,
): Promise<void> {
  if (!['qq', 'qqguild'].includes(session.platform)) return;
  try {
    const isCrack = !!(session.bot as any)?.config?.autoStreamText;

    if (isCrack) {
      const payload: Record<string, unknown> = {
        markdown: { content: markdown },
      };
      if ((keyboard as any)?.rows?.length) {
        payload.keyboard = { content: keyboard };
      }
      await session.send(h('qq:rawmarkdown', payload));
    } else {
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

      await session.bot.internal.sendMessage(session.channelId, payload);
    }
  } catch (e) {
    console.warn('⚠️💬 [QQ Markdown] 发送失败, 不影响图片:', (e as Error)?.message || e);
  }
}

export async function replyWithDiceMarkdownKeyboard(
  session: any,
  config: {
    enableQQMarkdown: boolean;
    qqMarkdownKeyboardJson: string;
    diceCommandName: string;
  },
  info: DiceRenderInfo,
): Promise<void> {
  if (
    !config.enableQQMarkdown ||
    !['qq', 'qqguild'].includes(session.platform)
  ) {
    return;
  }

  const md = buildDiceMarkdown(info);
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
