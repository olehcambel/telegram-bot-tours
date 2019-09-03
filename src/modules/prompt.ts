import { ContextMessageUpdate } from 'telegraf';
import ClientError from '../lib/errors/client';
import ValidateError from '../lib/errors/validate';
import { getQuizKb } from '../lib/keyboards';
import { Attachment, MessageParse, PromptFunc, State } from '../types/prompt';
import { QuestionKey } from '../types/quiz-key';
import PromptChats from './prompt-chats';
import { FunctionsKey, quizDefinition, quizFunctions, quizInterceptors } from './quiz';
import { validate as validator } from './schemas';

interface Extra {
  attachment?: Attachment;
}

export default class Prompt {
  static async start<T = any>(
    command: QuestionKey,
    ctx: ContextMessageUpdate,
    extra: Extra = {},
  ): Promise<T> {
    if (!ctx.from) throw new Error('no user info provided');

    // let promiseObj: Pick<State, 'reject' | 'resolve'>;
    let promiseObj: { resolve: any; reject: any };

    const promise = new Promise<T>((resolve, reject) => {
      promiseObj = { resolve, reject };
    });

    const telegramCode = ctx.from.id;
    const question = quizDefinition[command][0];
    const initMessage = question.message || '';

    await ctx.reply('keyboards.quiz.initMsg', getQuizKb(ctx).quizKbInit);

    if (initMessage) {
      await ctx.reply(question.isI18n ? ctx.i18n.t(initMessage) : initMessage, {
        reply_markup: extra.attachment,
      });
    }

    const state: State = {
      initMessage,
      command,
      progress: 0,
      telegramCode,
      answers: {},
      setValue(key, value) {
        state[key] = value;
      },

      setAnswer(key, value) {
        state.answers[key] = value;
      },
      resolve: result => {
        PromptChats.delete(telegramCode);
        promiseObj.resolve(result);
      },
      reject: error => {
        PromptChats.delete(telegramCode);
        promiseObj.reject(error);
      },
    };

    // TODO: save current state to ctx.session
    PromptChats.create(telegramCode, state);

    if (question.funcName) {
      const [funcMessage, funcAttach] = await this.handleFunc(ctx, question.funcName);

      state.initMessage = funcMessage;
      state.attachment = funcAttach;
    }

    if (!state.initMessage) {
      throw new Error('initMessage must not be empty');
    }

    return promise;
  }

  static async processMessage(
    params: MessageParse,
    ctx: ContextMessageUpdate,
  ): Promise<boolean> {
    if (!ctx.from || !ctx.chat) throw new Error('no user info provided');

    const state = PromptChats.getState(ctx.from.id);

    if (!state) {
      return false;
    }

    let validateError = '';
    let userMessage = params.message;

    if (params.command === 'reset') {
      return this.reset(ctx, state);
    }

    if (params.command === 'cancel') {
      state.reject(new ClientError('messages.cancel', {}));
      return true;
    }

    if (state.progress === 0) {
      await ctx.reply('keyboards.quiz.msg', getQuizKb(ctx).quizKb);
    }

    const question = quizDefinition[state.command];
    const { prop, validate, intercept } = question[state.progress];

    try {
      if (validate) userMessage = validator(params.message, validate);
      if (prop) state.setAnswer(prop, userMessage);
      if (intercept) await quizInterceptors[intercept](state);

      state.progress += 1;
    } catch (error) {
      if (error instanceof ValidateError) {
        validateError = `${ctx.i18n.t('validate.error')} ${error.message}\n\n`;
      } else throw error;
    }

    if (question.length === state.progress) {
      state.resolve(state.answers);
      return true;
    }

    const { message, funcName, attachment, isI18n } = question[state.progress];

    if (message) {
      await this.replyOrEdit(
        ctx,
        validateError + (isI18n ? ctx.i18n.t(message) : message),
        attachment,
      );
    } else if (funcName) {
      await this.handleFunc(ctx, funcName, validateError);
    }

    return true;
  }

  private static async replyOrEdit(
    ctx: ContextMessageUpdate,
    message: string,
    attach?: Attachment,
  ): Promise<void> {
    await ctx.replyWithMarkdown(message, { reply_markup: attach });
  }

  private static async handleFunc(
    ctx: ContextMessageUpdate,
    funcName: FunctionsKey,
    messageError: string = '',
  ): Promise<PromptFunc> {
    if (!ctx.from) throw new Error('ctx.from not exist');
    const state = PromptChats.getState(ctx.from.id);

    const [funcMessage, funcAttach, isTranslate] = await quizFunctions[funcName](state, ctx);

    await this.replyOrEdit(
      ctx,
      messageError + (isTranslate ? ctx.i18n.t(funcMessage) : funcMessage),
      funcAttach,
    );

    return [funcMessage, funcAttach, isTranslate];
  }

  private static async reset(ctx: ContextMessageUpdate, state: State): Promise<boolean> {
    state.setValue('progress', 0);

    await ctx.reply('keyboards.quiz.initMsg', getQuizKb(ctx).quizKbInit);
    await this.replyOrEdit(ctx, state.initMessage, state.attachment);

    return true;
  }
}
