import { Update, Message } from "telegram-typings";
import { Dialogue } from "../src/MessageProcessor";

const ts = () => {
  const hrTime = process.hrtime();
  return hrTime[0] * 1000000 + (hrTime[1] / 1000 | 0);
}

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