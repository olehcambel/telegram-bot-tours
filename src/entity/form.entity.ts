import { Transform } from 'class-transformer';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import objectTransformer from '../lib/transform';
import Country from './country.entity';
import Currency from './currency.entity';
import FormStatus from './form-status.entity';
import User from './user.entity';

@Entity('forms')
export default class Form {
  @PrimaryGeneratedColumn() id: number;

  @Column({ length: 50 }) peopleCount: string;

  @Column('date') dateFrom: string;

  // @Column() nightsCount: number;

  @Column('date') dateTo: string;

  @Column({ default: 0 }) priceFrom: number;

  @Column({ nullable: true }) priceTo?: number;

  @Column({ length: 200, nullable: true }) comment?: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }) readonly createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  readonly updatedAt: Date;

  @Transform(objectTransformer(Currency), { toClassOnly: true })
  @ManyToOne(() => Currency, { onDelete: 'SET NULL', onUpdate: 'CASCADE' })
  currency: Currency;

  @Transform(objectTransformer(Country), { toClassOnly: true })
  @ManyToOne(() => Country, { onDelete: 'SET NULL', onUpdate: 'CASCADE' })
  country: Country;

  @Transform(objectTransformer(FormStatus), { toClassOnly: true })
  @ManyToOne(() => FormStatus, { onDelete: 'SET NULL', onUpdate: 'CASCADE' })
  formStatus: FormStatus;

  @Transform(objectTransformer(User), { toClassOnly: true })
  @ManyToOne(() => User, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  user: User;
}
