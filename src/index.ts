import { createConnection } from 'typeorm';
import * as http from './modules/http-server';
import Logger from './modules/logger';
import Bot from './modules/telegraf';

const logger = Logger('Bootstrap');

process.on('unhandledRejection', reason => {
  logger.error('Unhandled Rejection\n%o', reason);
  setTimeout(() => process.exit(1), 2000);
});

process.on('uncaughtException', error => {
  logger.error('Uncaught Exception\n%o', error);
  process.exit(1);
});

process.on('warning', error => {
  logger.error('Warning detected\n%o', error);
});

process.on('exit', code => {
  logger.info(`Stopped with code: ${code}`);
});

const bot = new Bot();

export const start = async (): Promise<void> => {
  await http.start();
  await createConnection();
  await bot.start();

  logger.info('Started');
};

export const stop = (): void => {};

if (!module.parent) {
  start();
  // bootstrap(start, stop);
}
