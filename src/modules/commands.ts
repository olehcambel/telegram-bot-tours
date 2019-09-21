import { ContextMessageUpdate, Markup } from 'telegraf';
import { getRepository } from 'typeorm';
import { format } from 'util';
import config from '../config';
import Currency from '../entity/currency.entity';
import FormStatus from '../entity/form-status.entity';
import Language from '../entity/language.entity';
import User from '../entity/user.entity';
import { camelToSnake } from '../lib/cases';
import ClientError from '../lib/errors/client';
import { saveToSession } from '../lib/session';
import Currencies from '../services/currency.service';
import Forms from '../services/form.service';
import Prices from '../services/price.service';
import Roles from '../services/role.service';
import Tours from '../services/tour.service';
import Users from '../services/user.service';
import { PromptFindTour, PromptSettings } from '../types/commands';
import { MessageParse } from '../types/prompt';
import commandInfo from './command-info';
import Logger from './logger';
import Prompt from './prompt';

const logger = Logger('commands');
const currencyCode = 'USD';

const commands: Commands = {
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
      let language = 1;
      if (ctx.from.language_code) {
        const lang = await getRepository(Language).findOne({ code: ctx.from.language_code });
        if (lang) language = lang.id;
      }

      await Users.create({
        role: 3,
        firstName: ctx.from.first_name,
        lastName: ctx.from.last_name,
        language,
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

  async menu(ctx) {
    const tgCode = Users.getTgCode(ctx);

    const role = await Roles.getUserRole(tgCode);
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

  async settings(ctx) {
    const result = await Prompt.start<PromptSettings>('settings', ctx);

    await Users.update({ id: result.id, [result.key]: result.value });

    if (result.key === 'language') {
      const { code } = await getRepository(Language).findOneOrFail({
        select: ['code'],
        where: [{ id: result.value }],
      });
      saveToSession(ctx, '__language_code', code);
      ctx.i18n.locale(code);
    }

    return true;
  },

  async about(ctx) {
    const inlineKb = Markup.inlineKeyboard([
      Markup.urlButton('GitHub', 'https://github.com/olehcambel'),
    ]);

    await ctx.replyWithMarkdown(ctx.i18n.t('other.about'), inlineKb.extra());

    return false;
  },

  async contact(ctx) {
    const { string: message } = await Prompt.start('getString', ctx, {
      initMessage: ctx.i18n.t('quiz.contact.writeToDev'),
    });

    const msg = `From: ${format(ctx.from)}\n\nMessage: ${message}`;

    await ctx.telegram.sendMessage(config.channel.support, msg);
    await ctx.reply(ctx.i18n.t('quiz.contact.messageDelivered'));

    return false;
  },

  async updateUser(ctx) {
    const tgCode = Users.getTgCode(ctx);

    const { roles } = commandInfo.updateUser;

    await Roles.check(tgCode, roles);

    const result = await Prompt.start<{ id: number; key: string; value: string }>(
      'updateUser',
      ctx,
    );

    await Users.update({ id: result.id, [result.key]: result.value });

    return true;
  },

  async updateCurrency(ctx) {
    const tgCode = Users.getTgCode(ctx);

    const { roles } = commandInfo.updateCurrency;

    await Roles.check(tgCode, roles);

    const currencies = await getRepository(Currency).find({ select: ['id', 'name'] });
    const attachment = Markup.inlineKeyboard(
      currencies.map(currency => Markup.callbackButton(currency.name, String(currency.id))),
    );

    const result = await Prompt.start('updateCurrency', ctx, { initAttach: attachment });

    await Currencies.update({ id: result.id, [result.key]: result.value });

    return true;
  },

  async formStatus(ctx, { message }) {
    if (!message) throw new ClientError('no message');
    const tgcode = Users.getTgCode(ctx);

    const roles = ['manager', 'watcher'];
    await Roles.check(tgcode, roles);

    const parsed = message.split('=');

    if (parsed.length !== 2) {
      return { message: 'messages.fail' };
    }

    const [statusName] = parsed;
    const formId = Number(parsed[1]);

    const statuses = await getRepository(FormStatus).find();
    const status = statuses.find(status => status.name === statusName);

    if (!status) {
      throw new Error(`invalid status ${statusName}`);
    }

    const form = await Forms.get(formId);
    const botMessage = Forms.formatForm({
      comment: form.comment,
      user: form.user,
      country: form.country,
      currency: form.currency,
      price: { priceFrom: form.priceFrom, priceTo: form.priceTo },
      status,
      formId: form.id,
      peopleCount: form.peopleCount,
      date: {
        dateFrom: form.dateFrom,
        dateTo: form.dateTo,
      },
    });

    const replyMarkup = Forms.formatKeyboard({
      formId: form.id,
      statuses,
      exclude: [status.id],
    });

    await Forms.update({ id: form.id, formStatus: status.id });
    await ctx.editMessageText(botMessage, {
      reply_markup: replyMarkup,
      parse_mode: 'Markdown',
    });

    return false;
  },

  async createTour(ctx) {
    const data = await Prompt.start<PromptFindTour>('createTour', ctx);

    const currency = await getRepository(Currency).findOneOrFail(data.currency, {
      select: ['code'],
    });

    let diffPrice = 1;

    if (currency.code !== 'USD') {
      // fetch current currency ??
      diffPrice = 1;
    }

    const price = Prices.extractPrice(data.price, diffPrice);
    const date = { dateFrom: data.dateFrom, dateTo: data.dateTo };
    const { country } = data;
    let comment: string | undefined;

    const tours = await Tours.get({ date, price, country });

    if (tours) {
      await Promise.all(
        tours.map(entity => {
          const caption =
            `Tour: #${entity.id}, ${entity.name}` +
            `\n${entity.description ? `\n${entity.description}` : ''}` +
            `\nPlace: ${entity.country.name}, ${entity.city}` +
            `\nPrice: ${entity.price} ${currencyCode}` +
            `\nDate: ${entity.dateFrom} - ${entity.dateTo}`;

          return ctx
            .replyWithPhoto(entity.coverUrl || 'https://picsum.photos/200/300/?random', {
              caption,
              reply_markup: Markup.inlineKeyboard([
                Markup.urlButton('Hotel', entity.hotelUrl),
              ]),
            })
            .catch(error => logger.error(error));
        }),
      );
    } else {
      const { string } = await Prompt.start('getString', ctx, {
        initMessage: ctx.i18n.t('quiz.createTour.comment'),
        initAttach: Markup.inlineKeyboard([
          Markup.callbackButton(ctx.i18n.t('keyboards.quiz.skip'), '-'),
        ]),
      });

      comment = string;
    }

    const formStatus = tours ? 2 : 1; // as 'open'
    const baseForm = {
      peopleCount: data.peopleCount,
      formStatus,
      user: data.id,
      country,
      currency: data.currency,
      comment,
    };

    const { id: formId } = await Forms.create({ ...price, ...date, ...baseForm });

    if (tours) return { message: 'quiz.createTour.found' };

    const result = await Forms.formatReplyAdmin({ price, date, ...baseForm, formId });

    await ctx.telegram.sendMessage(config.channel.admin, result.message, {
      parse_mode: 'Markdown',
      reply_markup: result.attachment,
    });

    return { message: 'quiz.createTour.finish' };
  },

  async getTgcode(ctx) {
    const code = Users.getTgCode(ctx);

    return { message: 'other.tgcode', templateDate: { code } };
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
