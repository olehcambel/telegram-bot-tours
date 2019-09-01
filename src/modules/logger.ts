import { existsSync, mkdirSync } from 'fs';
import { createLogger as createWinston, format, Logger, transports } from 'winston';
import config from '../config';
import WinstonTelegram from './winston-telegram';

const { combine, timestamp, label, printf, colorize, align, splat } = format;
const LOGDIR = './logs';
const loggers: Loggers = {};

if (!existsSync(LOGDIR)) {
  mkdirSync(LOGDIR, { recursive: true });
}

const getLogger = (namespace: string): Logger => {
  // const dirname = `${LOGDIR}/${namespace}`;

  const transportsArr = [
    new transports.Console({ level: config.consoleLogLevel }),
    // new transports.File({
    //   level: 'info',
    //   filename: 'info.txt',
    //   dirname,
    // }),
  ];

  if (config.channel.isUseChannel) {
    transportsArr.push(new WinstonTelegram({
      level: config.channel.logLevel || 'error',
    }) as any);
  }

  return createWinston({
    format: combine(
      colorize(),
      label({ label: namespace }),
      timestamp(),
      align(),
      splat(),
      printf(info => {
        const { timestamp, level, message, stack, label } = info;

        const ts = timestamp.slice(0, 19).replace('T', ' ');
        return `${ts} [${level}] [${label}]: ${
          typeof message === 'object' ? JSON.stringify(message, null, 4) : stack || message
        }`;
      }),
    ),
    transports: transportsArr,
  });
};

const createLogger = (namespace: string): Logger => {
  const name = namespace.toUpperCase();

  if (!loggers[name]) loggers[name] = getLogger(name);

  return loggers[name];
};

interface Loggers {
  [key: string]: Logger;
}

export default createLogger;
