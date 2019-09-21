import { plainToClass } from 'class-transformer';
import { Markup } from 'telegraf';
import { InlineKeyboardMarkup } from 'telegraf/typings/telegram-types';
import { createQueryBuilder, getRepository } from 'typeorm';
import Country from '../entity/country.entity';
import Currency from '../entity/currency.entity';
import Form from '../entity/form.entity';
import FormStatus from '../entity/form-status.entity';
import User from '../entity/user.entity';
import { type } from '../modules/joi-types';
import { schema, validate } from '../modules/schemas';
import { FormDto, FormUpdate } from '../types/dto/form';
import { Attachment } from '../types/prompt';

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

  static async formatReplyAdmin(
    data: FormatReplyAdmin,
  ): Promise<{ message: string; attachment: Attachment }> {
    const { formId } = data;

    const statuses = await getRepository(FormStatus).find();
    const status = statuses.find(status => status.id === data.formStatus);

    if (!status) throw new Error(`invald status: ${data.formStatus}`);

    const user = await getRepository(User).findOneOrFail(data.user, {
      select: ['username', 'firstName', 'lastName', 'phone', 'email'],
    });
    const country = await getRepository(Country).findOneOrFail(data.country, {
      select: ['name'],
    });
    const currency = await getRepository(Currency).findOneOrFail(data.currency, {
      select: ['code'],
    });

    const message = this.formatForm({
      status,
      comment: data.comment,
      peopleCount: data.peopleCount,
      date: data.date,
      formId,
      country,
      currency,
      price: data.price,
      user,
    });

    const replyMarkup = this.formatKeyboard({
      formId,
      statuses,
      exclude: [status.id],
    });

    return { message, attachment: replyMarkup };
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
      `\n*Начало:* ${params.date.dateFrom}` +
      `\n*Конец:* ${params.date.dateTo}` +
      `\n*Цена:* ${priceMessage}` +
      `\n*Коммент:* ${params.comment || '-'}` +
      `\n\nSTATUS: ${params.status.name}`;

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

  static async get(formId: number): Promise<Form> {
    validate(formId, type.id);

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

    return form;
  }
}

interface FormPrice {
  priceFrom: number;
  priceTo?: number;
}

interface FormDate {
  dateFrom: string;
  dateTo: string;
}

interface FormatReplyAdmin {
  user: number;
  country: number;
  currency: number;
  formId: number;
  price: FormPrice;
  date: FormDate;
  formStatus: number;

  comment?: string;
  peopleCount: string;
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
  status: FormStatus;
  comment?: string;
  formId: number;
  date: FormDate;
  price: FormPrice;
}
