import { I18n } from 'telegraf-i18n';

declare module 'telegraf' {
  interface ContextMessageUpdate {
    i18n: I18n;
  }
}
