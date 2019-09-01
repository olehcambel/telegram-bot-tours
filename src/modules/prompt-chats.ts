import { State, StateObj } from '../types/prompt';

export default class PromptChats {
  static create(id: number, obj: State): void {
    this.chats[id] = obj;
  }

  static delete(id: number): void {
    delete this.chats[id];
  }

  static get(): StateObj {
    return this.chats;
  }

  static getState(id: number): StateObj[number] {
    return this.chats[id];
  }

  static chats: StateObj = {};
}
