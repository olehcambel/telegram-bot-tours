import { getRepository } from 'typeorm';
import Country from '../entity/country';

export const seed = [
  {
    name: 'United States',
    code: 'US',
  },
  {
    name: 'United Kingdom',
    code: 'GB',
  },
  {
    name: 'Singapore',
    code: 'SG',
  },
  {
    name: 'France',
    code: 'FR',
  },
];

export default class CountrySeed {
  private repo = getRepository(Country);

  public async up(): Promise<boolean> {
    const exist = await this.repo.findOne();
    if (exist) return false;

    await this.repo.insert(seed);
    return true;
  }
}
