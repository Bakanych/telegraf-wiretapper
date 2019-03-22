import { Configuration } from "./Configuration";
import { Player } from "./Player";
import { Middleware, ContextMessageUpdate } from "telegraf";
import Recorder from "./Recorder";
import { YandexTextToSpeech } from "./Synthesizer";
import { LameEncoder } from "./Encoder";
import { MessageProcessor } from "./MessageProcessor";
import { getUserName } from "./TelegramHelper";

export class WireTapper {

  private recorder: Recorder = new Recorder();
  private player: Player;

  constructor(private config: Configuration) {
    this.player = new Player(
      new YandexTextToSpeech(this.config.yandexCloud.accessKey, this.config.yandexCloud.folderId),
      new LameEncoder(),
      new MessageProcessor());

  }

  middleware(): Middleware<ContextMessageUpdate> {
    return async (ctx, next) => {
      if (ctx.updateType === 'message' && ctx.update.message!.text) {
        const bot = await ctx.telegram.getMe();
        const bot_command_regex = new RegExp(`^\/${this.config.playCommand}(@${bot.username})?$`, "gi");
        if (ctx.update.message!.text!.match(bot_command_regex)) {
          this.play(ctx);
        }
        this.recorder.recordMessage(ctx);

      }
      if (next) await next();
    };

  }

  private async play(ctx: ContextMessageUpdate) {
    const user_name = getUserName(ctx.update.message!.from!);
    const messages = this.recorder.getNewMessages(ctx);
    if (!messages || messages.length === 0) {
      ctx.reply(`Терпение, ${user_name}...`);
      return;
    }

    ctx.reply(`Есть у меня одна плёночка, ${user_name}...`);
    const voiceMessage = await this.player.play(messages);
    if (voiceMessage)
      ctx.replyWithAudio({
        source: voiceMessage
      }, {
          caption: `Строго для ${user_name}!`,
          title: 'плёночка'
        });
    else
      ctx.reply('Явка провалена.');

  }
}
