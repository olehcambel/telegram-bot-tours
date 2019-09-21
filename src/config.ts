import { config } from 'dotenv-safe';
import { join } from 'path';

const getEnvInt = (key: string): number => parseInt(process.env[key]!, 10);
const getEnvBool = (key: string): boolean => ['true', '1'].includes(process.env[key]!);
const getEnv = (key: string): string => process.env[key]!;

config({
  allowEmptyValues: true,
  path: join(__dirname, '..', '.env'),
  sample: join(__dirname, '..', 'example.env'),
});

export default {
  botToken: getEnv('BOT_TOKEN'),
  consoleLogLevel: getEnv('CONSOLE_LOG_LEVEL'),

  channel: {
    isUseChannel: getEnvBool('IS_LOG_CHANNEL'),
    logLevel: getEnv('CHANNEL_LOG_LEVEL'),
    logId: getEnv('CHANNEL_LOG_ID'),
    admin: getEnv('CHANNEL_ADMIN'),
    support: getEnv('CHANNEL_SUPPORT'),
  },

  http: {
    port: getEnvInt('HTTP_PORT'),
  },
};
