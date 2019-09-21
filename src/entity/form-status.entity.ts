import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('formStatuses')
export default class FormStatus {
  @PrimaryGeneratedColumn() id: number;

  @Column({ length: 50 }) name: string;

  // @Column({ length: 50 }) type: string;
}
