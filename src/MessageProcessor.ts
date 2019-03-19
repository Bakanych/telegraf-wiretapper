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
      if (current.text && current.text.match(message_regex)) {
        // same user
        if (result.last === current.from!.id)
          result.arr[result.arr.length - 1].text += EOL + current.text;
        // next user
        else {
          result.arr.push({ user_id: current.from!.id, user_name: getUserName(current.from!), text: current.text! });
          result.last = current.from!.id;

          if (callback && result.arr.length >= 2) {
            callback(result.arr[result.arr.length - 2]);
          }
        }
      }

      // callback for the last entry
      if (callback && result.arr.length > 0 && i === messages.length - 1) {
        callback(result.arr[result.arr.length - 1]);
      }

      return result;
    }, { arr: [] as Dialogue[], last: null as unknown }).arr;
  }
}