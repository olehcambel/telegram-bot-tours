import { getRepository } from 'typeorm';
import Language from '../entity/language';

export const seed = [
  {
    id: 1,
    name: 'English',
    code: 'en',
  },
  {
    id: 2,
    name: 'Русский',
    code: 'ru',
  },
];

export default class LanguageSeed {
  private repo = getRepository(Language);

  public async up(): Promise<boolean> {
    const exist = await this.repo.findOne();
    if (exist) return false;

    await this.repo.insert(seed);
    return true;
  }
}
