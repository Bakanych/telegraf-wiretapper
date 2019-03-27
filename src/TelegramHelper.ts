import { User, Message } from "telegram-typings";

export function getUserName(user: User, only_first_name = true): string {
  const user_regex = /[\wа-я]+.*/gi
  const first_name = (user.first_name.match(user_regex) || [''])[0].trim();
  const last_name = (user.last_name && !only_first_name) ? (user.last_name.match(user_regex) || [''])[0].trim() : '';
  return `${first_name} ${last_name}`.trim() || user.username!;
}

export function getBotCommand(message: Message): string | undefined {
  if (!message.text)
    return undefined;

  const command_regex = /\/([\wа-я]+)(@\w+)?/ui
  const match = message.text!.match(command_regex);
  return (match && match.length >= 1) ? match[1] as string : undefined;
}

export function isCyrillic(text: string) {
  if (!text)
    return undefined;

  const ru_match = text.match(/[а-я]/giu);
  const ru_length = (ru_match) ? ru_match.length : 0;

  const eng_match = text.match(/[a-z]/giu);
  const eng_length = (eng_match) ? eng_match.length : 0;

  return ru_length >= eng_length;
}