import { ContextMessageUpdate, Markup } from 'telegraf';
import { ExtraReplyMessage } from 'telegraf/typings/telegram-types';

export const getMainKb = (ctx: ContextMessageUpdate): ExtraReplyMessage => {
  const settings = ctx.i18n.t('keyboards.main.settings');
  const createTour = ctx.i18n.t('keyboards.main.createTour');
  const about = ctx.i18n.t('keyboards.main.about');
  const contact = ctx.i18n.t('keyboards.main.contact');

  const mainKb = Markup.keyboard([[createTour, settings], [about, contact]]);

  return mainKb.resize().extra();
};

export const getQuizKb = (
  ctx: ContextMessageUpdate,
): { quizKb: ExtraReplyMessage; quizKbInit: ExtraReplyMessage } => {
  const back = ctx.i18n.t('keyboards.quiz.back');
  const cancel = ctx.i18n.t('keyboards.quiz.cancel');
  const reset = ctx.i18n.t('keyboards.quiz.reset');

  const quizKb = Markup.keyboard([[cancel, reset, back]])
    .resize()
    .extra();
  const quizKbInit = Markup.keyboard([cancel])
    .resize()
    .extra();

  return { quizKb, quizKbInit };
};
