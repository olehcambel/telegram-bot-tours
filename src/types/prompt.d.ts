import { InlineKeyboardMarkup } from 'telegraf/typings/telegram-types';
import { QuestionKey } from './quiz-key';

type StateUpdateValue = 'lastMessageId' | 'progress';

export interface State {
  reject: (reason: Error) => void;
  resolve: <T>(value?: T | PromiseLike<T> | undefined) => void;
  // resolve: <T>(args: any) => T;
  command: QuestionKey;
  initMessage: string;
  attachment?: Attachment;
  progress: number;
  telegramCode: number;
  setAnswer: <T>(key: string, value: T) => void;
  setValue: (key: StateUpdateValue, value: number) => void;
  answers: any;
  lastMessageId?: number;
  // role: string // manager (when user choose field to update)
  // validationMessageId?: number;
  // userMessage: string;
  // setUserMessage: () => void;
}

export type Attachment = InlineKeyboardMarkup;

export type PromptFunc = [string, Attachment?, boolean?];

export interface MessageParse {
  command?: string;
  message?: string;
}

export type StateObj = { [telegramCode: number]: State };
