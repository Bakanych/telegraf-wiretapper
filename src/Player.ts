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
    let raw_buffer: Buffer = Buffer.alloc(0);
    const voices = this.assignVoice(messages);

    this.messageProcessor.convertToPlayScript(messages, (dialogue => {
      const voice = voices.get(dialogue.user_id);
      const text = `${dialogue.user_name}${this.synthesizer.getPause()}${dialogue.text}`;
      promises.push(this.synthesizer.synthesize(text, voice));
    }));

    for (const promise of promises) {
      const voice_text = await promise;
      if (voice_text) {
        raw_buffer = Buffer.concat([raw_buffer, voice_text]);
      }
    }

    return (raw_buffer.length > 0) ? raw_buffer : undefined;
  }
}