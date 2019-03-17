import { Configuration } from "./Configuration";
import { Player } from "./Player";
import { Middleware, ContextMessageUpdate } from "telegraf";
import Tape from "./Tape";
import { YandexTextToSpeech } from "./Synthesizer";
import { LameEncoder } from "./Encoder";
import { MessageProcessor } from "./MessageProcessor";
import { getUserName } from "./TelegramHelper";
export class WireTapper {

  private tape: Tape;
  private player: Player;

  constructor(private config: Configuration) {
    this.tape = new Tape();
    this.player = new Player(
      new YandexTextToSpeech(this.config.yandexCloud.accessKey, this.config.yandexCloud.folderId),
      new LameEncoder(),
      new MessageProcessor());

    // @ts-ignore
    //this.tape.save({ update_id: 1, message: { text: 'test', from: { id: 1, username: 'one' }, chat: { id: 70326441 } } });

  }

  middleware(): Middleware<ContextMessageUpdate> {
    return (ctx, next) => {
      if (ctx.updateType === 'message' && ctx.update.message!.text) {
        const bot_command_regex = new RegExp(`^\/${this.config.playCommand}(@\\w+bot)?$`, "gi");
        if (ctx.update.message!.text!.match(bot_command_regex))
          this.play(ctx);

        this.tape.save(ctx.update);
      }
      if (next) return next();
    };

  }

  private async play(ctx: ContextMessageUpdate) {
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
