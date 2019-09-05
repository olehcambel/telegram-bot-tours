import { getRepository } from 'typeorm';
import Role from '../entity/role';

export const seed = [
  {
    id: 1,
    name: 'manager',
  },
  {
    id: 2,
    name: 'watcher',
  },
  {
    id: 3,
    name: 'user',
  },
];

export default class RoleSeed {
  private repo = getRepository(Role);

  public async up(): Promise<boolean> {
    const exist = await this.repo.findOne();
    if (exist) return false;

    await this.repo.insert(seed);
    return true;
  }
}
