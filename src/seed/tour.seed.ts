import { getRepository } from 'typeorm';
import Tour from '../entity/tour';
import CountrySeed from './country.seed';
import CurrencySeed from './currency.seed';

export const seed = [
  {
    id: 1,
    name: 'Tour to France #!',
    city: 'Paris',
    dateFrom: '2019-08-20',
    dateTo: '2019-08-31',
    hotelUrl: 'https://hotels.com/franc-tour.html',
    price: 500,
    country: { id: 4 },
  },
  {
    id: 2,
    name: 'Tour to Singapore, damn',
    city: 'Singapore',
    description: 'short desc about what this tour can offer to you',
    coverUrl: 'https://i1.sndcdn.com/artworks-000305846208-vx04g0-t500x500.jpg',
    dateFrom: '2019-12-10',
    dateTo: '2019-12-29',
    hotelUrl: 'https://hotels.com/singapore-tour.html',
    price: 2000,
    country: { id: 3 },
  },
  {
    id: 3,
    name: 'Tour to France #2',
    city: 'Paris',
    description: 'Try it out',
    dateFrom: '2020-12-10',
    dateTo: '2020-12-29',
    hotelUrl: 'https://hotels.com/france-tour.html',
    price: 50000,
    country: { id: 4 },
  },
];

export default class TourSeed {
  private repo = getRepository(Tour);

  public async up(): Promise<boolean> {
    const exist = await this.repo.findOne();
    if (exist) return false;

    await Promise.all([new CurrencySeed().up(), new CountrySeed().up()]);

    await this.repo.insert(seed);
    return true;
  }
}
