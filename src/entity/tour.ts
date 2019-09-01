import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tours')
export default class Role {
  @PrimaryGeneratedColumn() id: number;

  @Column({ length: 50 }) name: string;

  // dateFrom, dateTo, price, city?, hotelUrl, coverUrl, countryId, currencyId
}
