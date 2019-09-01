import joi from '@hapi/joi';

export const stringArray = joi.array().items(joi.string());
export const id = joi
  .number()
  .integer()
  .positive();
export const boolean = joi
  .boolean()
  .truthy(1, '1')
  .falsy(0, '0');
export const date = joi
  .string()
  .regex(/\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])/)
  .error(() => 'enter.Date');

export const type = {
  id: id.required(),
  date: date.required(),
  boolean: boolean.required(),
  string: joi.string().required(),
  dateNow: joi
    .date()
    .min('now')
    .iso()
    .required(),
};
