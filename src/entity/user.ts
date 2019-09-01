import { Transform } from 'class-transformer';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import objectTransformer from '../lib/transform';
import Role from './role';

@Entity('users')
export default class User {
  @PrimaryGeneratedColumn() id: number;

  @Column({ length: 50 }) firstName: string;

  @Column({ length: 50, nullable: true }) lastName?: string;

  // @Column({ length: 50, nullable: true }) middleName?: string;

  @Column({ length: 50, nullable: true }) email?: string;

  @Column({ length: 50, nullable: true }) phone?: string;

  @Column({ length: 50, nullable: true }) username?: string;

  @Column({ unique: true }) telegramCode: number;
  // @Column({ unique: true }) tgCode: number;

  @Column({ length: 50, default: 'en' }) languageCode: string;

  // @RelationId(() => Role)
  // roleId: number;

  @Transform(objectTransformer(Role), { toClassOnly: true })
  @ManyToOne(() => Role, { onDelete: 'SET NULL', onUpdate: 'CASCADE' })
  role: Role;
}
