import Telegraf from 'telegraf';
import Transport /* , { TransportStreamOptions } */ from 'winston-transport';
import config from '../config';

const pre = '```';

const logLevel = (level: string): string => {
  switch (level) {
    case '[31merror[39m':
      return 'ERROR';
    case '[33mwarn[39m':
      return 'WARN';
    case '[32minfo[39m':
      return 'INFO';
    case '[36mverbose[39m':
      return 'VERBOSE';
    case '[34mdebug[39m':
      return 'DEBUG';
    case '[32mhttp[39m':
      return 'HTTP';
    default:
      return 'UNKNOWN_LVL';
  }
};

// Inherit from `winston-transport` so you can take advantage
// of the base functionality and `.exceptions.handle()`.
//
export default class WinstonRocket extends Transport {
  bot = new Telegraf(config.botToken);
  // constructor(opts: TransportStreamOptions) {
  //   super(opts);

  // Consume any custom options here. e.g.:
  // - Connection information for databases
  // - Authentication information for APIs (e.g. loggly, papertrail,
  //   logentries, etc.).
  //
  // }

  async log(info: WinstonLog, callback: () => void): Promise<void> {
    setImmediate(() => {
      this.emit('logged', info);
    });

    const lvl = logLevel(info.level);
    // prettier-ignore
    const message = info.stack || info.message.length > 100
      ? `module **${info.label}** (${lvl})\n\n${pre}${info.stack || info.message}${pre}`
      : `module **${info.label}** (${lvl}) - \`${info.message}\``;

    await this.bot.telegram.sendMessage(config.channel.logId, message, {
      parse_mode: 'Markdown',
    });

    // await this.rocketAgent.channelSendWithReconnect(this.channel, message, attachments);

    // Perform the writing to the remote service
    callback();
  }
}

interface WinstonLog {
  level: string;
  label: string;
  timestamp: string;
  message: string;
  stack?: string;
}
