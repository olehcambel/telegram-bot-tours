import User from '../../entity/user.entity';

type Extracted = 'role' | 'language';
type NonRelation = Omit<User, Extracted | 'id'>;

export type UserDto = NonRelation & Record<Extracted, number>;
export type UserDtoUpdate = Partial<UserDto> & Pick<User, 'id'>;
