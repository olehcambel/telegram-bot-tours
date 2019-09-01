import { ContextMessageUpdate } from 'telegraf';
import ClientError from '../../lib/errors/client';
import ValidateError from '../../lib/errors/validate';
import { getQuizKb } from '../../lib/keyboards';
import { Attachment, MessageParse, PromptFunc, State } from '../../types/prompt';
import { QuestionKey } from '../../types/quiz-key';
import PromptChats from '../prompt-chats';
import {
  FunctionsKey,
  quizDefinition as questions,
  quizFunctions,
  quizInterceptors,
} from '../quiz';
import { validate as validator } from '../schemas';

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
    const question = questions[command][0];
    const initMessage = question.message || '';
    let lastMessageId: number | undefined;

    // TODO: add to state `attachKbId` - to replace quizKb later
    await ctx.reply('keyboards.quiz.initMsg', getQuizKb(ctx).quizKbInit);

    if (initMessage) {
      const reply = await ctx.reply(initMessage, {
        reply_markup: extra.attachment,
      });

      lastMessageId = reply.message_id;
    }

    const state: State = {
      initMessage,
      command,
      progress: 0,
      lastMessageId,
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

    if (ctx.chat.type === 'private') await ctx.deleteMessage();
    if (!state) {
      return false;
    }

    // if (state.lastMessageId) {
    //   await ctx.telegram.deleteMessage(ctx.from.id, state.lastMessageId);
    //   delete state.lastMessageId;
    // }

    if (!ctx.message) delete state.lastMessageId;

    let validateError = '';

    if (params.command === 'reset') {
      return this.reset(ctx, state);
    }

    if (
      params.command === 'cancel'
      // || (params.message && match('keyboards.quiz.cancel')(params.message, ctx))
    ) {
      // if (params.command && match('keyboards.quiz.cancel')(params.command, ctx)
      // || params.command === 'cancel') {
      state.reject(new ClientError('messages.cancel', {}));
      return true;
    }

    if (state.progress === 0) {
      await ctx.reply('keyboards.quiz.msg', getQuizKb(ctx).quizKb);
    }

    const question = questions[state.command];
    const { prop, validate, intercept } = question[state.progress];

    try {
      if (intercept) await quizInterceptors[intercept](state);
      if (validate) /* params.message = */ validator(params.message, validate);
      if (prop) state.setAnswer(prop, params.message);

      state.progress += 1;
    } catch (error) {
      if (error instanceof ValidateError) {
        validateError = `*Validation* ${error.message}\n\n`;
      } else throw error;
    }

    if (question.length === state.progress) {
      if (state.lastMessageId) {
        await ctx.telegram.deleteMessage(ctx.from.id, state.lastMessageId);
      }
      state.resolve(state.answers);
      return true;
    }

    const { message, funcName, attachment, isI18n } = question[state.progress];

    if (message) {
      await this.replyOrEdit(
        ctx,
        state,
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
    state: State,
    message: string,
    attach?: Attachment,
  ): Promise<void> {
    if (state.lastMessageId) {
      ctx.telegram.editMessageText(
        state.telegramCode,
        state.lastMessageId,
        undefined,
        message,
        {
          reply_markup: attach,
          parse_mode: 'Markdown',
        },
      );
    } else {
      const reply = await ctx.replyWithMarkdown(message, { reply_markup: attach });
      state.setValue('lastMessageId', reply.message_id);
    }
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
      state,
      messageError + (isTranslate ? ctx.i18n.t(funcMessage) : funcMessage),
      funcAttach,
    );

    return [funcMessage, funcAttach, isTranslate];
  }

  private static async reset(ctx: ContextMessageUpdate, state: State): Promise<boolean> {
    state.setValue('progress', 0);

    await ctx.reply('keyboards.quiz.initMsg', getQuizKb(ctx).quizKbInit);
    await this.replyOrEdit(ctx, state, state.initMessage, state.attachment);

    return true;
  }
}
