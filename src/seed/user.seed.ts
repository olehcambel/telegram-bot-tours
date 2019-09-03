import { getRepository } from 'typeorm';
import User from '../entity/user';
import { EntitySeed } from '../types/entity-seed';
import LanguageSeed from './language.seed';
import RoleSeed from './role.seed';

export const seed = [
  {
    id: 1,
    firstName: 'Oleh',
    lastName: 'Cambel',
    username: 'olehcambel',
    telegramCode: 312577109,
    language: { id: 1 },
    role: { id: 1 },
  },
  {
    id: 2,
    firstName: 'Svelte',
    lastName: 'Js',
    email: 'svelte@js.ru',
    telegramCode: 2,
    language: { id: 2 },
    role: { id: 3 },
  },
];

export default class UserSeed implements EntitySeed {
  private repo = getRepository(User);

  public async up(): Promise<boolean> {
    const exist = await this.repo.findOne();
    if (exist) return false;

    await Promise.all([new RoleSeed().up(), new LanguageSeed().up()]);

    await this.repo.insert(seed);
    return true;
  }
}
