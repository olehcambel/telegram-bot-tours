import { Transform } from 'class-transformer';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import objectTransformer from '../lib/transform';
import Country from './country.entity';

@Entity('tours')
export default class Tour {
  @PrimaryGeneratedColumn() id: number;

  @Column({ length: 50 }) name: string;

  @Column({ length: 50 }) city: string;

  // @Column({ length: 50 }) cityDepart: string;

  @Column('date') dateFrom: string;

  @Column('date') dateTo: string;

  @Column({ default: 0 }) price: number;

  @Column({ type: 'text', nullable: true }) description?: string;

  @Column('tinytext') hotelUrl: string;

  @Column({ type: 'tinytext', nullable: true }) coverUrl?: string;

  // all tours should be in one currency, not to cause problems with finding one tour

  // @Transform(objectTransformer(Currency), { toClassOnly: true })
  // @ManyToOne(() => Currency, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  // currency: Currency;

  @Transform(objectTransformer(Country), { toClassOnly: true })
  @ManyToOne(() => Country, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  country: Country;
}
