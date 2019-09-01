import { plainToClass } from 'class-transformer';
import { Markup } from 'telegraf';
import { InlineKeyboardMarkup } from 'telegraf/typings/telegram-types';
import { getRepository } from 'typeorm';
import Country from '../entity/country';
import Currency from '../entity/currency';
import Form from '../entity/form';
import FormStatus from '../entity/form-status';
import User from '../entity/user';
import { schema, validate } from '../modules/schemas';
import { FormDto, FormUpdate } from '../types/dto/form';

export default class Forms {
  static async create(params: FormDto): Promise<Form> {
    validate(params, schema.form.create);

    const data = plainToClass(Form, params);

    return getRepository(Form).save(data);
  }

  static async update(params: FormUpdate): Promise<void> {
    validate(params, schema.form.update);

    const { id, ...data } = plainToClass(Form, params);

    await getRepository(Form).update({ id }, data);
    // await getRepository(Form).save(data);
  }

  static formatForm(params: FormatForm): string {
    const fullname = `${params.user.firstName}${
      params.user.lastName ? ` ${params.user.lastName}` : ''
    }`;

    // TODO: replace with strings.js for constants
    const contactInfo =
      `Форма #${params.formId}\n\nКонтактная информация:` +
      `\n*ФИ:* ${fullname}` +
      `${params.user.email ? `\n*Почта:* ${params.user.email}` : ''}` +
      `${params.user.phone ? `\n*Телефон:* ${params.user.phone}` : ''}` +
      `${params.user.username ? `\n*Юзернейм:* @${params.user.username}` : ''}`;

    const priceMessage = `${params.price.priceFrom}${
      params.price.priceTo ? ` - ${params.price.priceTo}` : '+'
    } ${params.currency.code}`;

    const resultMessage =
      'Данные:' +
      `\n*Страна:* ${params.country.name}` +
      `\n*Кол-во людей:* ${params.peopleCount}` +
      `\n*Начало:* ${params.dateFrom}` +
      `\n*Конец:* ${params.dateTo}` +
      `\n*Цена:* ${priceMessage}` +
      `\n*Коммент:* ${params.comment}` +
      `\n\nSTATUS: ${params.formStatus}`;

    return `${contactInfo}\n\n${resultMessage}`;
  }

  static formatKeyboard(params: FormatFormMarkup): InlineKeyboardMarkup {
    const keyboard = Markup.inlineKeyboard(
      params.statuses.map(
        status =>
          Markup.callbackButton(
            status.name,
            `/form_status ${status.name}=${params.formId}`,
            params.exclude && params.exclude.includes(status.id),
          ),
        { columns: 3 },
      ),
    );
    return keyboard;
  }
}

interface FormatFormMarkup {
  statuses: FormStatus[];
  formId: number;
  exclude?: number[];
}

interface FormatForm {
  user: User;
  country: Country;
  currency: Currency;
  peopleCount: string;
  formStatus: string;
  dateFrom: string;
  dateTo: string;
  comment: string;
  formId: number;
  price: {
    priceFrom: number;
    priceTo?: number;
  };
}
