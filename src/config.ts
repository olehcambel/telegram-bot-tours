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
  botToken: process.env.BOT_TOKEN!,
  consoleLogLevel: process.env.CONSOLE_LOG_LEVEL!,

  channel: {
    isUseChannel: getEnvBool('IS_LOG_CHANNEL'),
    logLevel: process.env.CHANNEL_LOG_LEVEL!,
    logId: process.env.CHANNEL_LOG_ID!,
    admin: process.env.CHANNEL_ADMIN!,
    support: getEnv('CHANNEL_SUPPORT'),
  },

  http: {
    port: getEnvInt('HTTP_PORT'),
  },
};
