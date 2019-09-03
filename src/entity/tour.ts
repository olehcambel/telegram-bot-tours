import { Transform } from 'class-transformer';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import objectTransformer from '../lib/transform';
import Currency from './currency';

@Entity('tours')
export default class Role {
  @PrimaryGeneratedColumn() id: number;

  @Column({ length: 50 }) name: string;

  @Column({ length: 50 }) city: string;

  @Column('text') hotelUrl: string;

  @Column({ type: 'text', nullable: true }) coverUrl?: string;

  @Column('date') dateFrom: string;

  @Column('date') dateTo: string;

  @Column({ default: 0 }) price: number;

  @Transform(objectTransformer(Currency), { toClassOnly: true })
  @ManyToOne(() => Currency, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  currency: Currency;

  // @Transform(objectTransformer(Country), { toClassOnly: true })
  // @ManyToOne(() => Country, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  // country: Country;

  // dateFrom, dateTo, price, desc, city?, hotelUrl, coverUrl, countryId, currencyId
  // how to make title for different languages OR only in english
}
