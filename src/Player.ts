import { Message } from "telegram-typings";
import { Synthesizer, voices } from "./Synthesizer";
import { MessageProcessor } from "./MessageProcessor";
import tmp from 'tmp';
import fs from 'fs';
import path from 'path';
import { EOL } from "os";
import util from 'util';
const exec = util.promisify(require('child_process').exec);

export class Player {
  constructor(private synthesizer: Synthesizer, private messageProcessor: MessageProcessor) { }

  async playPhrase(user_name: string, phrase: string, voice: string) {
    const text = `${user_name}.${this.synthesizer.getPause()}${phrase}`;
    return await this.synthesizer.synthesize(text, voice);
  }

  async playScript(script: Message[], voices: Map<number, string>) {
    return await this.synthesizeDialog(script, voices);
  }

  private assignVoice(messages: Message[]) {
    const users = [...new Set(messages.map(x => x.from!.id))];
    const result = new Map<number, string>();
    users.map((user, i) => result.set(user, voices[i % voices.length]));
    return result;
  }

  private async synthesizeDialog(messages: Message[], user_voices: Map<number, string>) {
    if (messages.length === 0)
      return undefined;

    const tmp_dir = tmp.dirSync().name;
    const promises: Promise<Buffer | undefined>[] = [];
    const oggs: string[] = [];

    this.messageProcessor.convertToPlayScript(messages, (dialogue => {
      const voice = user_voices.get(dialogue.user_id) || voices[0];
      const text = `${dialogue.user_name}.${this.synthesizer.getPause()}${dialogue.text}`;
      promises.push(this.synthesizer.synthesize(text, voice));
    }));

    const result_buffer = (await Promise.all(promises))
      .reduce((total, buf, i) => {
        if (buf) {
          // save buffer to file
          const ogg_path = path.join(tmp_dir, i.toString() + '.ogg');
          const stream = fs.createWriteStream(ogg_path);
          stream.write(buf);
          oggs.push(ogg_path);
          total = Buffer.concat([total!, buf]);
        }
        return total;
      }, Buffer.alloc(0));

    if (oggs.length > 1) {
      const result_ogg = await this.concatOgg(oggs, tmp_dir);
      if (result_ogg) {
        return fs.readFileSync(result_ogg);
      }
      else
        return undefined;
    }
    else
      return (result_buffer!.length > 0) ? result_buffer : undefined;
  }

  private async concatOgg(oggs: string[], output_dir: string) {
    const list_file = path.join(output_dir, 'list.txt');
    const output_file = path.join(output_dir, 'out.ogg');
    fs.createWriteStream(list_file).write(oggs.map(x => `file '${x}'`).join(EOL));
    const command = `ffmpeg -f concat -safe 0 -i ${list_file} -c copy ${output_file}`;
    await exec(command);
    return output_file;
  }
}