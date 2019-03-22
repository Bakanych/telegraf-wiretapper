import { Message } from "telegram-typings";
import { ContextMessageUpdate, Context } from "telegraf";

export default class Recorder {

  recordMessage(ctx: ContextMessageUpdate) {
    ctx.session.messages = ctx.session.messages || [];
    ctx.session.messages.push(ctx.update.message!);
  }

  getNewMessages(ctx: ContextMessageUpdate) {
    if (!ctx.session.messages)
      return [];

    const user_id = ctx.update.message!.from!.id;
    const user_messages = ctx.session.messages.filter(x => x.from!.id === user_id);
    if (user_messages.length > 0) {
      const user_last_message_date = user_messages[user_messages.length - 1].date;
      return ctx.session.messages.filter(x => x.date > user_last_message_date)
    }

    return [];
  }
}