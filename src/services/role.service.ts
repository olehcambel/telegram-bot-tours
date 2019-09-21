import { createQueryBuilder } from 'typeorm';
import User from '../entity/user.entity';
import ClientError from '../lib/errors/client';

export default class Roles {
  static async check(telegramCode: number, roles: string[]): Promise<boolean> {
    const user = await createQueryBuilder(User, 'u')
      .select(['r.name', 'u.id'])
      .innerJoin('u.role', 'r')
      .where('u.telegramCode = :id', { id: telegramCode })
      .getOne();

    if (!user) {
      throw new Error('not found user with role');
    }

    const isAllow = roles.includes(user.role.name);

    if (!isAllow) {
      throw new ClientError('validate.roleDeny', { role: user.role.name });
    }

    return true;
  }

  static async getUserRole(telegramCode: number): Promise<string> {
    const user = await createQueryBuilder(User, 'u')
      .leftJoin('u.role', 'r')
      .select(['u.id', 'r.name'])
      .where('u.telegramCode = :id', { id: telegramCode })
      .getOne();

    if (!user) {
      throw new ClientError('validate.notFound', {});
    }

    if (!user.role) {
      throw new ClientError('validate.noRole', {});
    }

    return user.role.name;
  }
}
