import { plainToClass } from 'class-transformer';
import { getRepository } from 'typeorm';
import User from '../entity/user';
import { EntitySeed } from '../types/entity-seed';
import RoleSeed from './role.seed';

export const seed = [
  {
    id: 1,
    firstName: 'Oleh',
    lastName: 'Cambel',
    username: 'olehcambel',
    telegramCode: 312577109,
    languageCode: 'en',
    // role: { id: 1 },
    role: 1,
  },
  {
    id: 2,
    firstName: 'Svelte',
    lastName: 'Js',
    email: 'svelte@js.ru',
    telegramCode: 2,
    languageCode: 'ru',
    // role: { id: 3 },
    role: 3,
  },
];

export default class UserSeed implements EntitySeed {
  private repo = getRepository(User);

  public async up(): Promise<boolean> {
    const exist = await this.repo.findOne();
    if (exist) return false;

    await new RoleSeed().up();

    const classSeed = plainToClass(User, seed);

    await this.repo.insert(classSeed);
    return true;
  }
}
