import { plainToClass } from 'class-transformer';
import { ContextMessageUpdate } from 'telegraf';
import { getRepository } from 'typeorm';
import User from '../entity/user';
import { type } from '../modules/joi-types';
import { schema, validate } from '../modules/schemas';
import { UserDto, UserDtoUpdate } from '../types/dto/user';

export default class Users {
  static async create(params: UserDto): Promise<void> {
    validate(params, schema.user.create);

    const data = plainToClass(User, params);

    await getRepository(User).save(data);
  }

  static async update(params: UserDtoUpdate): Promise<void> {
    validate(params, schema.user.update);

    const { id, ...data } = plainToClass(User, params);

    await getRepository(User).update({ id }, data);
  }

  static async delete(id: number): Promise<void> {
    validate(id, type.id);

    await getRepository(User).delete({ id });
  }

  static getTgCode(ctx: ContextMessageUpdate): number {
    if (!ctx.from) throw new Error('no ctx.from');

    return ctx.from.id;
  }
}
