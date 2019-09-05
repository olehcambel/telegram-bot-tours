export default class Prices {
  /**
   * @param diffPrice 1 USD = 25 UAH as 25
   */
  static extractPrice(price: string, diffPrice = 1): ExtractPriceRes {
    const priceReg = price.match(/^(\d+)?\s?-\s?(\d+)?$/);

    if (!priceReg) throw new Error('price not matched');

    const [, from, to] = priceReg;

    const priceFrom = from ? Number(from) * diffPrice : 0;
    const priceTo = to ? Number(to) * diffPrice : undefined;

    return { priceFrom, priceTo };
  }
}

interface ExtractPriceRes {
  priceFrom: number;
  priceTo?: number;
}
