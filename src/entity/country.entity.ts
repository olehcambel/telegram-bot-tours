import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('countries')
export default class Country {
  @PrimaryGeneratedColumn() id: number;

  @Column({ length: 50 }) name: string;

  @Column({ length: 2, unique: true }) code: string;
}
