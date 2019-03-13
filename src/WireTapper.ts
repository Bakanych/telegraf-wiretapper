import { Configuration } from "./Configuration";
import { Player } from "./Player";
import { Middleware, ContextMessageUpdate } from "telegraf";
import { Tape } from "./Tape";
import { YandexSpeechToText } from "./Synthesizer";
import { LameEncoder } from "./Encoder";
import { MessageProcessor } from "./MessageProcessor";
import { getUserName } from "./TelegramHelper";
export class WireTapper {

  private tape: Tape;
  private player: Player;

  constructor(private config: Configuration) {
    this.tape = new Tape();
    this.player = new Player(
      new YandexSpeechToText(this.config.yandexCloud.accessKey, this.config.yandexCloud.folderId),
      new LameEncoder(),
      new MessageProcessor());

  }

  middleware(): Middleware<ContextMessageUpdate> {
    return (ctx, next) => {
      if (ctx.updateType === 'message') {
        this.tape.save(ctx.update);
      }
      if (next) return next();
    };

  }

  async play(ctx: ContextMessageUpdate) {
    const user_name = getUserName(ctx.update.message!.from!);
    const messages = this.tape.getUserMessages(ctx.update);
    if (messages.length === 0) {
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
