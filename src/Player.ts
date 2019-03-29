import { Message } from "telegram-typings";
import { Synthesizer, Voice } from "./Synthesizer";
import { MessageProcessor } from "./MessageProcessor";
import tmp from 'tmp';
import fs from 'fs';
import { EOL } from "os";
import util from 'util';
const exec = util.promisify(require('child_process').exec);
import del from 'del';
import { isCyrillic } from "./TelegramHelper";

export class Player {
  constructor(private synthesizer: Synthesizer, private messageProcessor: MessageProcessor) { }

  async playPhrase(user_name: string, phrase: string, voice: Voice) {
    const lang = isCyrillic(phrase) ? 'ru-RU' : 'en-US';
    const text = `${user_name}.${this.synthesizer.getPause()}${phrase}`;
    return await this.synthesizer.synthesize(text, lang, voice);
  }

  public assignVoice(messages: Message[]) {
    const users = [...new Set(messages.map(x => x.from!.id))];
    const voices_map = new Map<number, string>(Object.values(Voice)
      .map((x, i) => [i, x] as [number, string]));

    const result = new Map<number, Voice>();
    users.map((user, i) => result.set(user, voices_map.get(i % voices_map.size) as Voice));
    return result;
  }

  public async playScript(messages: Message[], user_voices: Map<number, Voice | undefined>) {
    if (messages.length === 0)
      return undefined;

    const promises: Promise<Buffer | undefined>[] = [];
    const oggs: string[] = [];

    this.messageProcessor.convertToPlayScript(messages, (dialogue => {
      const text = `${dialogue.user_name}.${this.synthesizer.getPause()}${dialogue.text}`;
      const lang = isCyrillic(dialogue.text) ? 'ru-RU' : 'en-US';
      const voice = user_voices.get(dialogue.user_id) || Voice.Oksana;
      promises.push(this.synthesizer.synthesize(text, lang, voice));
    }));

    const result_buffer = (await Promise.all(promises))
      .reduce((total, buf, i) => {
        if (buf) {
          // save buffer to file
          const ogg_path = tmp.tmpNameSync({ postfix: '.ogg' });
          fs.createWriteStream(ogg_path, { autoClose: true }).write(buf);
          oggs.push(ogg_path);
          total = Buffer.concat([total!, buf]);
        }
        return total;
      }, Buffer.alloc(0));

    if (oggs.length > 1) {
      return await this.concatOgg(oggs);
    }
    else
      return (result_buffer!.length > 0) ? result_buffer : undefined;
  }

  private async concatOgg(oggs: string[]) {
    const list_file = tmp.tmpNameSync({ postfix: '.txt' });
    const output_file = tmp.tmpNameSync({ postfix: '.ogg' });
    fs.createWriteStream(list_file, { autoClose: true })
      .write(oggs.map(x => `file '${x}'`).join(EOL));
    const command = `ffmpeg -f concat -safe 0 -i ${list_file} -c copy ${output_file}`;
    await exec(command);
    const buffer = fs.readFileSync(output_file);

    await del(output_file, { force: true });
    await del(list_file, { force: true });

    await Promise.all(oggs.map(async x => await del(x, { force: true })));

    return buffer;
  }
}