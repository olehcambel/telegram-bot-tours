import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type Languages = 'en' | 'ru';

@Entity('languages')
export default class Language {
  @PrimaryGeneratedColumn() id: number;

  @Column({ length: 50 }) name: string;

  @Column({ length: 2 }) code: string;
}
