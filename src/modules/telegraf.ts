import { join } from 'path';
import Telegraf, { ContextMessageUpdate } from 'telegraf';
import TelegrafI18n, { match } from 'telegraf-i18n';
import config from '../config';
import ClientError from '../lib/errors/client';
import ValidateError from '../lib/errors/validate';
import { getMainKb } from '../lib/keyboards';
import { MessageParse } from '../types/prompt';
import commands from './commands';
import Logger from './logger';
import Prompt from './prompt';
import PromptChats from './prompt-chats';
import { snakeToCamel } from '../lib/cases';

const logger = Logger('Telegraf');

class Bot {
  private bot = new Telegraf(config.botToken);

  private keyboard = getMainKb;

  private i18n = new TelegrafI18n({
    defaultLanguage: 'en',
    allowMissing: false,
    directory: join(__dirname, '..', '..', 'src', 'locales'),
    // directory: `${__dirname}/locales`,
  });

  async start(): Promise<void> {
    logger.info('Starting bot');

    await this.bot.launch();

    this.bot.use(this.i18n.middleware());

    this.bot.on('message', async ctx => {
      this.initCmd(ctx).catch(error => {
        return this.validateError(error, ctx);
      });
    });

    this.bot.on('callback_query', async ctx => {
      this.initCmd(ctx).catch(error => {
        return this.validateError(error, ctx);
      });
      // try {
      //   await this.initCmd(ctx);
      // } catch (error) {
      //   await this.validateError(error, ctx);
      // }
    });
  }

  async initCmd(ctx: ContextMessageUpdate): Promise<void> {
    if (!ctx.from) throw new Error('no ctx.from');

    const { message, callbackQuery } = ctx;

    let newMessage = '';
    if (message && message.text) newMessage = message.text;
    else if (callbackQuery && callbackQuery.data) {
      newMessage = callbackQuery.data;
    } else return;

    const parsed = Bot.parseMessageKb(ctx, newMessage);

    try {
      const result = await Prompt.processMessage(parsed, ctx);

      if (result) return;
    } catch (error) {
      const state = PromptChats.getState(ctx.from.id);
      state.reject(error);
      return;
    }

    if (parsed.command) {
      const command = commands(parsed.command);

      if (command) {
        const commandMessage = await command(ctx, parsed);

        if (commandMessage) {
          if (typeof commandMessage === 'boolean') {
            await ctx.reply(ctx.i18n.t('messages.success'), this.keyboard(ctx));
          } else {
            await ctx.reply(
              ctx.i18n.t(commandMessage.message, commandMessage.templateDate),
              this.keyboard(ctx),
            );
          }
        }

        return;
      }
    }

    await ctx.reply(ctx.i18n.t('messages.notFound'), this.keyboard(ctx));
    // await ctx.telegram.editMessageText(r.chat.id, r.message_id, r.message_id, 'fuuuu');
    // await ctx.telegram.deleteMessage(r.chat.id, r.message_id)
  }

  private async validateError(error: Error, ctx: ContextMessageUpdate): Promise<void> {
    if (ctx.chat) {
      if (error instanceof ClientError) {
        const isPrivate = ctx.chat.type === 'private';
        const message = error.templateData
          ? ctx.i18n.t(error.message, error.templateData)
          : error.message;

        if (isPrivate) {
          await ctx.reply(message, this.keyboard(ctx));
        } else {
          await ctx.answerCbQuery(message);
        }

        return;
      }
      if (error instanceof ValidateError) {
        await ctx.reply(error.message, this.keyboard(ctx));

        return;
      }
    }

    await ctx.reply(ctx.i18n.t('messages.fail'), this.keyboard(ctx));

    logger.error(error);
  }

  private static parseMessageKb(ctx: ContextMessageUpdate, data: string): MessageParse {
    const params = Bot.parseMessage(data);
    // const params = { command: '', message: '⭕️ Reset' };
    const { message } = params;

    if (!message || params.command) return params;

    const button = Bot.buttons.find(button => match(button)(message, ctx));

    if (!button) return params;

    const splitted = button.split('.');

    params.command = splitted[splitted.length - 1];
    delete params.message;

    return params;
  }

  private static parseMessage(data: string): MessageParse {
    const filtered = data.trim();
    const result = filtered.match(/^(\/)(?<command>\w+) ?(?<message>.+)?/);

    if (!result || !result.groups || !result.groups.command) {
      return { message: filtered };
    }

    const { command, message } = result.groups;

    return { command: snakeToCamel(command), message };
  }

  private static buttons = [
    'keyboards.quiz.back',
    'keyboards.quiz.cancel',
    'keyboards.quiz.reset',
    'keyboards.main.findTour',
    'keyboards.main.createTour',
    'keyboards.main.settings',
    'keyboards.main.about',
    'keyboards.main.contact',
  ];
}

export default Bot;
