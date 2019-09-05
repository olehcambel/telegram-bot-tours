import { createQueryBuilder } from 'typeorm';
import Tour from '../entity/tour';

interface TourGet {
  price: {
    priceFrom: number;
    priceTo?: number;
  };
  date: {
    dateFrom: string;
    dateTo: string;
  };
  country: number;
}

export default class Tours {
  static async get(search: TourGet): Promise<false | Tour[]> {
    const { date, price } = search;

    const sql = createQueryBuilder(Tour, 't')
      .innerJoinAndSelect('t.country', 'c')
      .where('t.country = :country', { country: search.country })
      .andWhere('t.dateFrom BETWEEN :dateFrom AND date_add(:dateFrom, INTERVAL 3 DAY)', {
        dateFrom: date.dateFrom,
      })
      .andWhere(
        `t.dateTo BETWEEN
            date_sub(:dateTo, INTERVAL 3 DAY)
            AND date_add(:dateTo, INTERVAL 3 DAY)`,
        { dateTo: date.dateTo },
      );

    if (price.priceTo) {
      sql.andWhere('t.price BETWEEN :from AND :to', {
        from: price.priceFrom,
        to: price.priceTo,
      });
    } else {
      sql.andWhere('t.price >= :from', { from: price.priceFrom });
    }

    // if (search.priceFrom && search.priceTo) {
    //   sql.andWhere('t.price BETWEEN :from AND :to', {
    //     from: search.priceFrom,
    //     to: search.priceTo,
    //   });
    // }

    // priceFrom: 200 hrn
    // priceTo: 400 hrn

    // price: 10 USD

    // // how to count. 1 hrn = 25 USD
    // priceFrom = 8
    // priceTo = 16

    /**
     * правильная выгрузка даты. высчитывать кол-во дней по dateFrom dateTo
     * и делать поиск только по этому колву дней. и +-2 дня по dateFrom dateTo
     */

    const result = await sql.getMany();

    return result.length ? result : false;
  }
}
