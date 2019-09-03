import { getRepository } from 'typeorm';
import Form from '../entity/form';
import CreateFormStatus from './form-status.seed';
import CreateUser from './user.seed';
import CreateCurrency from './currency.seed';

export const seed = [
  {
    id: 1,
    peopleCount: '2-10',
    dateFrom: '2019-08-20',
    dateTo: '2019-08-31',
    priceFrom: 150,
    priceTo: 200,
    comment: '-',
    formStatus: { id: 1 },
    user: { id: 1 },
    currency: { id: 2 },
  },
  {
    id: 2,
    peopleCount: '2-10',
    dateFrom: '2019-09-20',
    dateTo: '2019-10-31',
    priceFrom: 2000,
    comment: 'please contact me',
    formStatus: { id: 2 },
    user: { id: 2 },
    currency: { id: 3 },
  },
  {
    id: 3,
    peopleCount: '2',
    dateFrom: '2020-01-10',
    dateTo: '2020-02-29',
    priceTo: 1000,
    comment: '-',
    formStatus: { id: 3 },
    user: { id: 1 },
    currency: { id: 3 },
  },
];

export default class FormSeed {
  private repo = getRepository(Form);

  public async up(): Promise<boolean> {
    const exist = await this.repo.findOne();
    if (exist) return false;

    await Promise.all([
      new CreateUser().up(),
      new CreateFormStatus().up(),
      new CreateCurrency().up(),
    ]);

    await this.repo.insert(seed);
    return true;
  }
}
