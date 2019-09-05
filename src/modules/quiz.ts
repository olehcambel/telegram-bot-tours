import { Schema } from '@hapi/joi';
import { ContextMessageUpdate, Markup } from 'telegraf';
import { createQueryBuilder, getRepository } from 'typeorm';
import Country from '../entity/country';
import Currency from '../entity/currency';
import Language from '../entity/language';
import Role from '../entity/role';
import User from '../entity/user';
import ClientError from '../lib/errors/client';
import { Attachment, PromptFunc, State } from '../types/prompt';
import { QuestionKey } from '../types/quiz-key';
import { type } from './joi-types';

const isObject = <T extends object>(data: T): boolean => {
  return !!(data && data.toString() === '[object Object]' && !Array.isArray(data));
};

export const updateDef: UpdateDef = {
  settings: {
    firstName: {
      validate: type.string,
      message: 'quiz.user.firstName',
    },
    lastName: {
      validate: type.string,
      message: 'quiz.user.lastName',
    },
    email: {
      validate: type.string,
      message: 'quiz.user.email',
    },
    phone: {
      validate: type.string,
      message: 'quiz.user.phone',
    },
    username: {
      validate: type.string,
      message: 'quiz.user.username',
    },
    language: {
      validate: type.id,
      funcName: 'getLanguages',
      selector: 'l.name',
    },
  },
  updateUser: {
    email: {
      validate: type.string,
      message: 'quiz.user.email',
    },
    phone: {
      validate: type.string.email(),
      message: 'quiz.user.phone',
    },
    role: {
      validate: type.string,
      funcName: 'getRoles',
      selector: 'r.name',
    },
  },
  updateCurrency: {
    name: {
      validate: type.string,
      message: 'quiz.currency.name',
    },
    code: {
      validate: type.string,
      message: 'quiz.currency.code',
    },
  },
};

const getSelect = (method: QuestionKey, defaultTable: string): string[] => {
  return Object.entries(updateDef[method]).map(([key, value]) => {
    return value.selector ? value.selector : `${defaultTable}.${key}`;
  });
};

export const quizDefinition: QuizDefinition = {
  getString: [{ prop: 'string', validate: type.string }],

  createTour: [
    {
      prop: 'country',
      funcName: 'getCountries',
      validate: type.id,
    },
    {
      prop: 'peopleCount',
      isI18n: true,
      message: 'quiz.createTour.peopleCount',
      validate: type.string.regex(/^\d+\s?a(\s\d+\s?c)?$/),
    },
    {
      prop: 'dateFrom',
      isI18n: true,
      message: 'quiz.createTour.dateFrom',
      validate: type.dateNow,
    },
    {
      prop: 'dateTo',
      isI18n: true,
      message: 'quiz.createTour.dateTo',
      validate: type.dateNow,
    },
    { prop: 'currency', funcName: 'getCurrencies', validate: type.id },
    {
      prop: 'price',
      isI18n: true,
      message: 'quiz.createTour.price',
      validate: type.string.regex(/^(\d+)?\s?-\s?(\d+)?$/).error(() => 'validate.price'),
    },
    // {
    //   prop: 'comment',
    //   isI18n: true,
    //   message: 'quiz.createTour.comment',
    // attachment: Markup.inlineKeyboard([Markup.callbackButton('btn.skip', '-')]).extra(),
    //   validate: type.string,
    // },
    {
      prop: 'confirm',
      funcName: 'confirm',
      intercept: 'getSqlMe',
      validate: type.string.only('ok'),
    },
  ],

  settings: [
    {
      prop: 'key',
      funcName: 'getKeysByMe',
      sql() {
        return createQueryBuilder(User, 'u')
          .leftJoin('u.language', 'l')
          .select(getSelect('settings', 'u'))
          .where(`u.id = :id`);
      },
    },
    { prop: 'value', funcName: 'chooseKey' },
  ],

  updateUser: [
    { prop: 'id', isI18n: true, message: 'quiz.user.telegramCode', intercept: 'getSqlUser' },
    {
      prop: 'key',
      funcName: 'getKeys',
      sql() {
        return createQueryBuilder(User, 'u')
          .select(getSelect('updateUser', 'u').concat('u.id'))
          .leftJoin('u.role', 'r')
          .where(`u.id = :id`);
      },
    },
    { prop: 'value', funcName: 'chooseKey' },
  ],

  updateCurrency: [
    { prop: 'id', funcName: 'getCurrencies' },
    {
      prop: 'key',
      funcName: 'getKeys',
      sql: () =>
        createQueryBuilder(Currency, 'c')
          .select(getSelect('updateCurrency', 'c'))
          .where('c.id = :id'),
    },
    { prop: 'value', funcName: 'chooseKey' },
  ],
};

export const quizInterceptors = {
  async getSqlUser(state: State): Promise<void> {
    if (!state.answers.id) {
      throw new Error(`no answers.id in ${state.command}`);
    }

    const user = await getRepository(User).findOne({ telegramCode: state.answers.id });
    if (!user) throw new ClientError('error.notFound');

    state.setAnswer('id', user.id);
  },

  async getSqlMe(state: State): Promise<void> {
    const user = await getRepository(User).findOneOrFail({ telegramCode: state.telegramCode });

    state.setAnswer('id', user.id);
  },
};

export const quizFunctions = {
  async getKeys(state: State, ctx: ContextMessageUpdate): Promise<PromptFunc> {
    const { sql } = quizDefinition[state.command][state.progress];

    if (!sql) throw new Error(`provide sql query in ${state.command}`);

    const result = await sql()
      .setParameter('id', state.answers.id)
      .getOne();

    if (!result) throw new ClientError('getKeys.notFound');
    const botMessage = [];
    const attachment = [];

    for (const [key, value] of Object.entries<any>(result)) {
      const tKey = ctx.i18n.t(`quiz.buttons.${key}`);

      botMessage.push(
        `*${tKey}* - ${
          value && isObject(value)
            ? value.name
            : value || `_${ctx.i18n.t('quiz.buttons.noResult')}_`
        }`,
      );

      attachment.push(Markup.callbackButton(tKey, key));
    }

    return [
      `${ctx.i18n.t('other.editInfo')} \n\n${botMessage.join('\n')}`,
      Markup.inlineKeyboard(attachment, { columns: 2 }),
    ];
  },

  async chooseKey(state: State, ctx: ContextMessageUpdate): Promise<PromptFunc> {
    const value = updateDef[state.command][state.answers.key];

    if (!value) throw new ClientError('error.value');

    if (value.funcName) {
      return this[value.funcName](state, ctx);
    }

    if (!value.message) throw new Error(`no default message ${state.command}`);

    return [value.message, undefined, true];
  },

  async getKeysByMe(state: State, ctx: ContextMessageUpdate): Promise<PromptFunc> {
    await quizInterceptors.getSqlMe(state);

    return this.getKeys(state, ctx);
  },

  confirm(state: State): PromptFunc {
    const string = [];
    for (const [key, value] of Object.entries(state.answers)) {
      string.push(`*${key}*: ${value}`);
    }

    return [string.join('\n'), Markup.inlineKeyboard([Markup.callbackButton('submit', 'ok')])];
  },

  async getCountries(): Promise<PromptFunc> {
    const result = await getRepository(Country).find({ select: ['id', 'name'] });

    return [
      'choose.country',
      Markup.inlineKeyboard(result.map(r => Markup.callbackButton(r.name, String(r.id))), {
        columns: 3,
      }),
      true,
      // { i18n: true },
    ];
  },

  async getRoles(): Promise<PromptFunc> {
    const result = await getRepository(Role).find();

    return [
      'choose.role',
      Markup.inlineKeyboard(result.map(r => Markup.callbackButton(r.name, String(r.id))), {
        columns: 3,
      }),
      true,
    ];
  },

  async getCurrencies(): Promise<PromptFunc> {
    const result = await getRepository(Currency).find({ select: ['id', 'name'] });

    return [
      'choose.currency',
      Markup.inlineKeyboard(result.map(r => Markup.callbackButton(r.name, String(r.id))), {
        columns: 3,
      }),
      true,
    ];
  },

  async getLanguages(): Promise<PromptFunc> {
    const result = await getRepository(Language).find({ select: ['id', 'name'] });

    return [
      'choose.language',
      Markup.inlineKeyboard(result.map(r => Markup.callbackButton(r.name, String(r.id))), {
        columns: 3,
      }),
      true,
    ];
  },
};

export type InterceptorsKey = keyof typeof quizInterceptors;

export type FunctionsKey = keyof typeof quizFunctions;

export interface Question {
  prop?: string;
  message?: string;
  attachment?: Attachment;
  funcName?: FunctionsKey;
  intercept?: InterceptorsKey;
  validate?: Schema;
  sql?: () => any;
  isI18n?: boolean;
}

export interface QuestionUpdate {
  validate: Schema;
  message?: string;
  // buttonText: string;
  funcName?: FunctionsKey;
  selector?: string;
}

export type QuizDefinition = Record<QuestionKey, Question[]>;

export type UpdateDef = Record<string, { [key: string]: QuestionUpdate }>;
