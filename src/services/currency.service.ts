import { DeepPartial, getRepository } from 'typeorm';
import Currency from '../entity/currency';
import { schema, validate } from '../modules/schemas';

export default class Currencies {
  static async create(params: DeepPartial<Currency>): Promise<void> {
    validate(params, schema.user.create);

    await getRepository(Currency).save(params);
  }

  static async update(params: DeepPartial<Currency>): Promise<void> {
    const data = validate(params, schema.currency.update);

    await getRepository(Currency).save(data);
  }
}
