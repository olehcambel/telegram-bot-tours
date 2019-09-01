import { createConnection } from 'typeorm';
import SeedRun from './seed-run';

const logger = console;

const start = async (): Promise<void> => {
  const connection = await createConnection();

  try {
    await SeedRun.start();
  } catch (error) {
    logger.error(error);
  }

  await connection.close();
};

export default start;

if (!module.parent) {
  start();
}
