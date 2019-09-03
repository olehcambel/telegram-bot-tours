import { ContextMessageUpdate } from 'telegraf';

type SessionDataField = '__language_code';

export const saveToSession = (
  ctx: ContextMessageUpdate,
  field: SessionDataField,
  data: string,
): void => {
  ctx.session[field] = data;
};

export const deleteFromSession = (
  ctx: ContextMessageUpdate,
  field: SessionDataField,
): void => {
  delete ctx.session[field];
};
