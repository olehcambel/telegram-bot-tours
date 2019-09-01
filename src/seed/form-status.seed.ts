import { getRepository } from 'typeorm';
import FormStatus from '../entity/form-status';

export const seed = [
  {
    id: 1,
    name: 'open',
  },
  {
    id: 2,
    name: 'close',
  },
  {
    id: 3,
    name: 'not interested',
  },
  {
    id: 4,
    name: 'proccessing',
  },
  {
    id: 5,
    name: 'no response',
  },
];

export default class FormStatusSeed {
  private repo = getRepository(FormStatus);

  public async up(): Promise<boolean> {
    const exist = await this.repo.findOne();
    if (exist) return false;

    await this.repo.insert(seed);
    return true;
  }
}
