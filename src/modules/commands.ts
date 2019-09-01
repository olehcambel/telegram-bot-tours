import { ContextMessageUpdate, Markup } from 'telegraf';
import { createQueryBuilder, getRepository } from 'typeorm';
import config from '../config';
import Country from '../entity/country';
import Currency from '../entity/currency';
import Form from '../entity/form';
import FormStatus from '../entity/form-status';
import User from '../entity/user';
import { camelToSnake } from '../lib/cases';
import Currencies from '../services/currency.service';
import Forms from '../services/form.service';
import Roles from '../services/role.service';
import Users from '../services/user.service';
import { MessageParse } from '../types/prompt';
import commandInfo from './command-info';
import Prompt from './prompt';

const logger = console;

const commands: Commands = {
  async menu(ctx) {
    if (!ctx.from) throw new Error('no ctx.from');

    const role = await Roles.getUserRole(ctx.from.id);
    const result = [];

    for (const [commandName, { roles }] of Object.entries(commandInfo)) {
      if (roles.length === 0 || roles.includes(role)) {
        result.push(
          `/${camelToSnake(commandName)} - ${ctx.i18n.t(`commands.${commandName}`)}`,
        );
      }
    }

    await ctx.reply(`${ctx.i18n.t('messages.success')}\n\n${result.join('\n')}`);

    return false;
  },

  async start(ctx) {
    await ctx.reply(ctx.i18n.t('validate.validating'));

    if (ctx.from) {
      const telegramCode = ctx.from.id;

      const isExist = await getRepository(User).count({ where: { telegramCode } });
      if (isExist) {
        return { message: 'startAgain', templateDate: { name: ctx.from.first_name } };

        // await ctx.telegram.editMessageText(
        //   reply.chat.id,
        //   reply.message_id,
        //   undefined,
        //   ctx.i18n.t('startAgain', { name: ctx.from.first_name }),
        //   getMainKb(ctx),
        // );
      }

      await Users.create({
        role: 3,
        firstName: ctx.from.first_name,
        lastName: ctx.from.last_name,
        languageCode: ctx.from.language_code || 'en',
        telegramCode,
        username: ctx.from.username,
      });
    }

    return { message: 'start' };
    // await ctx.telegram.editMessageText(
    //   reply.chat.id,
    //   reply.message_id,
    //   undefined,
    //   ctx.i18n.t('start'),
    //   getMainKb(ctx),
    // );

    // return false;
  },

  async register(ctx) {
    if (!ctx.from) throw new Error('no ctx.from');
    const roles = ['manager'];

    await Roles.check(ctx.from.id, roles);

    const result = await Prompt.start('register', ctx);

    logger.info(result);
    return true;
  },

  async getTgcode(ctx) {
    if (!ctx.from) throw new Error('no ctx.from');

    return { message: 'settings.tgcode', templateDate: { code: ctx.from.id } };
  },

  async settings(ctx) {
    const result = await Prompt.start<{ id: number; key: string; value: string }>(
      'settings',
      ctx,
    );

    await Users.update({ id: result.id, [result.key]: result.value });

    return true;
  },

  async updateUser(ctx) {
    if (!ctx.from) throw new Error('no ctx.from');

    const { roles } = commandInfo.updateUser;

    await Roles.check(ctx.from.id, roles);

    const result = await Prompt.start<{ id: number; key: string; value: string }>(
      'updateUser',
      ctx,
    );

    await Users.update({ id: result.id, [result.key]: result.value });

    return true;
  },

  async updateCurrency(ctx) {
    if (!ctx.from) throw new Error('no ctx.from');

    const { roles } = commandInfo.updateCurrency;

    await Roles.check(ctx.from.id, roles);

    const currencies = await getRepository(Currency).find({ select: ['id', 'name'] });
    const attachment = Markup.inlineKeyboard(
      currencies.map(currency => Markup.callbackButton(currency.name, String(currency.id))),
    );

    const result = await Prompt.start('updateCurrency', ctx, { attachment });

    await Currencies.update({ id: result.id, [result.key]: result.value });

    return true;
  },

  async formStatus(ctx, { message }) {
    if (!message || !ctx.from) throw new Error('no message or ctx.from');

    const roles = ['manager', 'watcher'];
    await Roles.check(ctx.from.id, roles);

    const parsed = message.split('=');

    if (parsed.length !== 2) {
      // throw new Error()
      return { message: 'messages.fail' };
    }

    const formId = Number(parsed[1]);
    const [statusName] = parsed;

    const form = await createQueryBuilder(Form, 'f')
      .select([
        'u.firstName',
        'u.lastName',
        'u.email',
        'u.phone',
        'u.username',
        'f.id',
        'cur.code',
        'c.name',
        'f.peopleCount',
        'f.dateFrom',
        'f.dateTo',
        'f.priceFrom',
        'f.priceTo',
        'f.comment',
      ])
      .innerJoin('f.user', 'u')
      .innerJoin('f.country', 'c')
      .innerJoin('f.currency', 'cur')
      .where('f.id = :id', { id: formId })
      .getOne();

    if (!form) throw new Error(`no form with id ${formId}`);

    const statuses = await getRepository(FormStatus).find();
    const status = statuses.find(status => status.name === statusName);

    if (!status) {
      throw new Error(`invalid status ${statusName}`);
    }

    const botMessage = Forms.formatForm({
      comment: form.comment,
      user: form.user,
      country: form.country,
      currency: form.currency,
      price: { priceFrom: form.priceFrom, priceTo: form.priceTo },
      formStatus: status.name,
      formId: form.id,
      peopleCount: form.peopleCount,
      dateFrom: form.dateFrom,
      dateTo: form.dateTo,
    });

    const replyMarkup = Forms.formatKeyboard({ formId, statuses, exclude: [status.id] });

    await Forms.update({ id: Number(formId), formStatus: status.id });
    await ctx.editMessageText(botMessage, {
      reply_markup: replyMarkup,
      parse_mode: 'Markdown',
    });

    return false;
  },

  async createTour(ctx) {
    const data = await Prompt.start('createTour', ctx);

    data.user = data.id;

    const priceReg = data.price.match(/^(\d+)?\s?-\s?(\d+)?$/);
    delete data.id;
    delete data.confirm;
    delete data.price;

    if (!priceReg) throw new Error('price not matched');

    const [, priceFrom = 0, priceTo] = priceReg;

    const user = await getRepository(User).findOneOrFail(data.user, {
      select: ['username', 'firstName', 'lastName', 'phone', 'email'],
    });
    const country = await getRepository(Country).findOneOrFail(data.countryId, {
      select: ['name'],
    });
    const currency = await getRepository(Currency).findOneOrFail(data.currencyId, {
      select: ['code'],
    });
    const statuses = await getRepository(FormStatus).find();
    const formStatus = 1; // as 'open'

    Object.assign(data, { priceFrom, priceTo, formStatus });

    const { id } = await Forms.create(data);

    const botMessage = Forms.formatForm({
      formStatus: statuses[0].name,
      comment: data.comment,
      peopleCount: data.peopleCount,
      dateFrom: data.dateFrom,
      dateTo: data.dateTo,
      formId: id,
      country,
      currency,
      price: {
        priceFrom,
        priceTo,
      },
      user,
    });

    const replyMarkup = Forms.formatKeyboard({
      formId: id,
      statuses,
      exclude: [formStatus],
    });

    await ctx.telegram.sendMessage(config.channel.admin, botMessage, {
      parse_mode: 'Markdown',
      reply_markup: replyMarkup,
    });

    return { message: 'quiz.createTour.finish' };
  },
};

/**
 * * return { message: 'startAgain', messageId: reply.message_id }; // edit msg with i18n
 * * return false; // do nothing
 * * return true; // reply with default string;
 * * return 'quiz.start'; // reply msg with i18n
 */
type Command = (
  ctx: ContextMessageUpdate,
  params: MessageParse,
) => Promise<boolean | { message: string; templateDate?: Object }>;

interface Commands {
  [x: string]: Command;
}

const get = (funcName: string): Command => {
  return commands[funcName];
};

export default get;
