import { I18n } from 'telegraf-i18n';
import { ContextMessageUpdate } from 'telegraf';

declare module 'telegraf-i18n' {
  interface I18n {
    locale(languageCode: string): void;
  }

  export function match(
    resourceKey: string,
    templateData?: any,
  ): (text: string, ctx: ContextMessageUpdate) => null | string[];
}
