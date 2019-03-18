import { Message } from 'telegram-typings';
import { getUserName } from './TelegramHelper';
import { EOL } from 'os';

export interface Dialogue {
  user_id: number,
  user_name: string,
  text: string
}

export class MessageProcessor {

  convertToPlayScript(messages: Message[], callback?: (dialogue: Dialogue) => any) {

    const message_regex = /.*[\wа-я]+.*/gi;

    return messages.reduce((result, current, i) => {
      let should_add_text = current.text && current.text.match(message_regex);

      if (result.last === current.from!.id && should_add_text)
        result.arr[result.arr.length - 1].text += EOL + current.text;
      else {
        if (should_add_text) {
          result.arr.push({ user_id: current.from!.id, user_name: getUserName(current.from!), text: current.text! });
          result.last = current.from!.id;
        }
        if (callback && result.arr.length >= 2)
          callback(result.arr[result.arr.length - 2]);
      }
      if (callback && result.arr.length > 0 && i === messages.length - 1)
        callback(result.arr[result.arr.length - 1]);

      return result;
    }, { arr: [] as Dialogue[], last: null as unknown }).arr;
  }
}