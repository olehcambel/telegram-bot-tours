import { getRepository } from 'typeorm';
import Country from '../entity/country.entity';

export const seed = [
  {
    id: 1,
    name: 'United States',
    code: 'US',
  },
  {
    id: 2,
    name: 'United Kingdom',
    code: 'GB',
  },
  {
    id: 3,
    name: 'Singapore',
    code: 'SG',
  },
  {
    id: 4,
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
