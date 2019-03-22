import { Message } from 'telegram-typings';

export * from './WireTapper';
export * from './Configuration';

export interface TelegrafSession {
  messages: Message[]
}

declare module 'telegraf' {
  interface ContextMessageUpdate {
    session: TelegrafSession;
  }
}