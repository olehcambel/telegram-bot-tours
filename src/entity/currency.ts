import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('currencies')
export default class Currency {
  @PrimaryGeneratedColumn() id: number;

  @Column({ length: 50 }) name: string;

  @Column({ length: 3, unique: true }) code: string;
}
