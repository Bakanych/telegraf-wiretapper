import { Update, Message, User } from "telegram-typings";
import { Dialogue } from "../src/MessageProcessor";
import { TelegrafSession } from "../src";

const ts = () => {
  const hrTime = process.hrtime();
  return hrTime[0] * 1000000 + (hrTime[1] / 1000 | 0);
}

const mockTelegram: any = {
  getMe: () => new Promise<User>(resolve => resolve({ id: 1, is_bot: true, username: 'mybot', first_name: 'mybot' }))
}

const reply = (text: string) => console.log(text);

export const getDialogue = (user_id = 1, text: string): Dialogue => ({
  user_id: user_id,
  user_name: user_id.toString(),
  text: text
});

export const getMessage = (user_id = 1, text?: string | undefined): Message =>
  ({
    message_id: 1,
    text: text,
    from: { id: user_id, is_bot: false, first_name: user_id.toString() },
    date: ts(),
    chat: { id: 1, type: 'group' }
  });

export const getUpdate = (message: Message = getMessage()): Update => ({
  update_id: ts(),
  message: message
});

export const getSession = (): TelegrafSession => ({
  messages: []
});

export const getContext = (update: Update, session: TelegrafSession): any => ({
  updateType: 'message',
  update: update,
  session: session,
  telegram: mockTelegram,
  reply: reply
});