import { getRepository } from 'typeorm';
import Currency from '../entity/currency';

export const currency = [
  {
    name: 'dollar',
    code: 'USD',
  },
  {
    name: 'euro',
    code: 'EUR',
  },
  {
    name: 'bitcoin',
    code: 'BTC',
  },
];

export default class CurrencySeed {
  private repo = getRepository(Currency);

  public async up(): Promise<boolean> {
    const exist = await this.repo.findOne();
    if (exist) return false;

    await this.repo.insert(currency);
    return true;
  }
}
