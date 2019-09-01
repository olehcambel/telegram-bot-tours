import User from '../../entity/user';

type Extracted = 'role';
type NonRelation = Omit<User, Extracted | 'id'>;

export type UserDto = NonRelation & Record<Extracted, number>;
export type UserDtoUpdate = Partial<UserDto> & Pick<User, 'id'>;
