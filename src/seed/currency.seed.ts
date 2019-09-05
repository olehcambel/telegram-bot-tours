import { getRepository } from 'typeorm';
import Currency from '../entity/currency';

export const currency = [
  {
    id: 1,
    name: 'dollar',
    code: 'USD',
  },
  {
    id: 2,
    name: 'euro',
    code: 'EUR',
  },
  {
    id: 3,
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
