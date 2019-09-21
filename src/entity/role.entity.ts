import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('roles')
export default class Role {
  @PrimaryGeneratedColumn() id: number;

  @Column({ length: 50 }) name: string;
}
