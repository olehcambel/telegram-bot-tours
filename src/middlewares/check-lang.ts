import { ContextMessageUpdate } from 'telegraf';
import { createQueryBuilder } from 'typeorm';
import User from '../entity/user';

export default () => async (ctx: ContextMessageUpdate, next?: () => any): Promise<any> => {
  if (!ctx.from) {
    throw new Error('no ctx.from');
  }

  if (!ctx.session.__language_code) {
    const user = await createQueryBuilder(User, 'u')
      .innerJoin('u.language', 'l')
      .select(['u.id', 'l.code'])
      .where('u.telegramCode = :id', { id: ctx.from.id })
      .getOne();

    if (user) {
      ctx.i18n.locale(user.language.code);
    }
  }

  if (typeof next === 'function') return next();
  return true;
};
