import { Message } from "telegram-typings";
import { Synthesizer } from "./Synthesizer";
import { Encoder } from "./Encoder";
import { MessageProcessor } from "./MessageProcessor";

export class Player {
  constructor(private synthesizer: Synthesizer, private encoder: Encoder, private messageProcessor: MessageProcessor) { }

  async play(messages: Message[]) {
    const raw_buffer = await this.synthesizeDialog(messages);
    return (raw_buffer) ? await this.encoder.encode(raw_buffer) : undefined;
  }

  private assignVoice(messages: Message[]) {
    const users = [...new Set(messages.map(x => x.from!.id))];
    const result = new Map<number, string>();
    users.map((user, i) => result.set(user, this.synthesizer.voices[i % this.synthesizer.voices.length]));
    return result;
  }

  private async synthesizeDialog(messages: Message[]) {
    if (messages.length === 0)
      return undefined;

    const promises: Promise<Buffer | undefined>[] = [];
    const voices = this.assignVoice(messages);

    this.messageProcessor.convertToPlayScript(messages, (dialogue => {
      const voice = voices.get(dialogue.user_id);
      const text = `${dialogue.user_name}.${this.synthesizer.getPause()}${dialogue.text}`;
      promises.push(this.synthesizer.synthesize(text, voice));
    }));

    const result = (await Promise.all(promises))
      .reduce((total, buf) => {
        if (buf) {
          total = Buffer.concat([total!, buf]);
        }
        return total;
      }, Buffer.alloc(0));

    return (result!.length > 0) ? result : undefined;
  }
}