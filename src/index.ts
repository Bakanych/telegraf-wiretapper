import { WireTapperModel } from './Storage';

export * from './WireTapper';
export * from './Storage';
export * from './Configuration';
export * from './Synthesizer';
export * from './TelegramHelper';

declare module 'telegraf' {
  interface ContextMessageUpdate {
    session: WireTapperModel
  }
}