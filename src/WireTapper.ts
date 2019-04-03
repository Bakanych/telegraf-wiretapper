import { Configuration } from "./Configuration";
import { Player } from "./Player";
import { Middleware, ContextMessageUpdate } from "telegraf";
import { getNewMessages, pushMessage, getUserProfiles, updateMessage } from "./Storage";
import { YandexTextToSpeech, Voice } from "./Synthesizer";
import { MessageProcessor } from "./MessageProcessor";
import { getUserName, getBotCommand } from "./TelegramHelper";

export class WireTapper {

  readonly player: Player;

  constructor(private config: Configuration) {
    this.player = new Player(
      new YandexTextToSpeech(this.config.yandexCloud.accessKey, this.config.yandexCloud.folderId),
      new MessageProcessor());

  }

  middleware(): Middleware<ContextMessageUpdate> {
    return async (ctx, next) => {
      if (next) await next();
      let play_result = false;
      if (ctx.updateType === 'message' && ctx.update.message!.text) {

        const bot_command = getBotCommand(ctx.update.message!);
        if (bot_command === this.config.playCommand)
          play_result = await this.play(ctx);

        if (play_result || !bot_command)
          pushMessage(ctx);

        return;
      }

      if (ctx.updateType === 'edited_message') {
        return updateMessage(ctx);
      }
    };

  }

  private async play(ctx: ContextMessageUpdate): Promise<boolean> {
    const user_name = getUserName(ctx.update.message!.from!);
    const messages = getNewMessages(ctx);
    //console.log(messages.map(x => `${x.from!.first_name}: ${x.text}`));
    if (!messages || messages.length === 0) {
      ctx.reply(`Терпение, ${user_name}...`);
      return true;
    }

    ctx.reply(`Есть у меня одна плёночка, ${user_name}...`);
    const voices = new Map(getUserProfiles(ctx).map(x => [x.user_id, x.voice] as [number, Voice | undefined]));
    const voiceMessage = await this.player.playScript(messages, voices);
    if (voiceMessage) {
      ctx.replyWithAudio(
        {
          source: voiceMessage
        },
        {
          caption: `Строго для ${user_name}!`,
          title: 'плёночка'
        });
      return true;
    }
    else {
      ctx.reply('Явка провалена.');
      return false;
    }

  }
}
