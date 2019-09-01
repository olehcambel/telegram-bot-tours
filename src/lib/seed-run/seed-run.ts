import { exists, readdir } from 'fs';
import { promisify } from 'util';
import { EntitySeed } from '../../types/entity-seed';

const logger = console;
const existsP = promisify(exists);
const readdirP = promisify(readdir);

export default class SeedRun {
  static async start(): Promise<void> {
    const seedPath = `${__dirname}/../../seed`;

    if (!(await existsP(seedPath))) throw new Error(`Invalid path "${seedPath}"`);

    const files = await readdirP(seedPath);
    files.sort();

    for (const fileName of files) {
      if (/(.*)\.js$/.test(fileName)) {
        // eslint-disable-next-line no-await-in-loop
        await this.runOne(seedPath, fileName);
      }
    }
  }

  private static async runOne(seedPath: string, fileName: string): Promise<void> {
    const path = `${seedPath}/${fileName}`;
    const { default: Seed } = (await import(path)) as { default: typeof EntitySeed };

    const isSeeded = await new Seed().up();

    if (!isSeeded) logger.warn(`${fileName} already exists`);
    // if (!isSeeded) logger.info(`Already exists in ${fileName}`);
  }
}
