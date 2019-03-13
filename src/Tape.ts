import { Update, Message } from "telegram-typings";

export class Tape {
  private updates: Update[] = [];
  private markers = new Map<number, Map<number, number>>();
  constructor() {
  }

  private getChatMarkers(chat_id: number) {
    return this.markers.get(chat_id)! || this.markers.set(chat_id, new Map()).get(chat_id);
  }

  private getUserMarker(chat_id: number, user_id: number): number {
    return this.getChatMarkers(chat_id)!.get(user_id)! || 0;
  }

  private updateUserMarker(chat_id: number, user_id: number, update_id: number) {
    let chatMarkers = this.getChatMarkers(chat_id);
    chatMarkers.set(user_id, update_id);
    this.markers.set(chat_id, chatMarkers);
  }

  /**
  * push telegram update into storage and updates user marker
  * @param update
  */
  save(update: Update) {

    this.updates.push(update);

    const chat_id = update.message!.chat.id;
    const user_id = update.message!.from!.id;
    this.updateUserMarker(chat_id, user_id, update.update_id);
  }

  getUserMessages(update: Update): Message[] {
    const chat_id = update.message!.chat.id;
    const user_id = update.message!.from!.id;
    const userMarker = this.getUserMarker(chat_id, user_id);
    return this.updates.filter(x => x.message!.chat.id === chat_id && x.update_id > userMarker && x.message!.from!.id !== user_id)
      .map(x => x.message!);
  }
}