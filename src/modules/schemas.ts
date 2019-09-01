import joi, { Schema, ValidationError } from '@hapi/joi';
import ValidateError from '../lib/errors/validate';
import * as types from './joi-types';

interface ErrorObjectResult {
  message: string;
  property?: string;
}

const joiErrorObject = (errors: ValidationError): ErrorObjectResult => {
  let message = '';
  let property = '';
  const error = errors.details[0];

  if (error.message) message = error.message;
  if (error.path.length > 0) [property] = error.path;

  return { message, property };
};

export const validate = <T>(object: T, schema: Schema, isServer?: boolean): T => {
  const { value, error } = joi.validate(object, schema);

  if (!error) return value;

  const { message, property } = joiErrorObject(error);
  const errorMessage = property
    ? `Error in property ${property}. Message: ${message}`
    : `Message: ${message}`;

  throw new (isServer ? Error : ValidateError)(errorMessage);
};

export const schema = {
  types: {
    id: types.id.required(),
    string: joi.string().required(),
  },
  user: {
    create: joi.object().keys({
      firstName: joi.string().required(),
      lastName: joi.string(),
      username: joi.string(),
      languageCode: joi.string(),
      telegramCode: types.id.required(),
      role: types.id.required(),
    }),
    update: joi.object().keys({
      id: types.id.required(),
      firstName: joi.string(),
      lastName: joi.string(),
      email: joi.string().email(),
      phone: joi.string(),
      username: joi.string(),
      languageCode: joi.string(),
      role: types.id,
    }),
  },

  currency: {
    create: joi.object({
      name: joi.string().required(),
      code: joi.string().required(),
    }),
    update: joi.object().keys({
      id: types.id.required(),
      name: joi.string(),
      code: joi.string(),
    }),
  },

  form: {
    create: joi.object().keys({
      peopleCount: joi.string().required(),
      dateFrom: joi.string().required(),
      dateTo: types.date.required(),
      comment: joi.string().required(),
      priceFrom: joi
        .number()
        .integer()
        .required(),
      priceTo: joi.number().integer(),
      currency: types.id.required(),
      country: types.id.required(),
      formStatus: types.id.required(),
      user: types.id.required(),
    }),
    update: joi.object().keys({
      id: types.id.required(),
      formStatus: types.id,
    }),
  },
};
