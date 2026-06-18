import "dotenv/config";
import { Bot, session } from "grammy";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { SocksProxyAgent } = require("socks-proxy-agent");
import { config } from "./config";
import { BotContext, BotSession, OrderData } from "./types";
import {
  BUDGET_CALLBACKS,
  CANCEL_CALLBACK,
  SERVICE_CALLBACKS,
  budgetKeyboard,
  cancelKeyboard,
  serviceKeyboard,
} from "./keyboards";
import {
  adminLeadMessage,
  budgetMessage,
  contactMessage,
  descriptionMessage,
  successMessage,
  welcomeMessage,
} from "./messages";

const apiTimeoutMs = 20_000;
const retryDelayMs = 5_000;
const allowedUpdates = ["message", "callback_query"] as const;

const agent = config.proxyUrl
  ? new SocksProxyAgent(config.proxyUrl, { timeout: apiTimeoutMs })
  : undefined;

const bot = new Bot<BotContext>(config.botToken, {
  client: {
    baseFetchConfig: agent ? { agent: agent as never } : undefined,
  },
});

function initialSession(): BotSession {
  return { step: "idle", order: {} };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function isCommand(value: string): boolean {
  return value.startsWith("/");
}

function resetOrder(ctx: BotContext): OrderData {
  ctx.session.step = "service";
  ctx.session.order = {};
  return ctx.session.order;
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function startOrder(ctx: BotContext) {
  resetOrder(ctx);
  await ctx.reply(welcomeMessage(), {
    parse_mode: "HTML",
    reply_markup: serviceKeyboard,
  });
}

bot.use(session({ initial: initialSession }));

bot.command("start", startOrder);

bot.command("cancel", async (ctx) => {
  ctx.session = initialSession();
  await ctx.reply(
    "Заявка отменена. Чтобы начать заново, отправьте /start",
  );
});

bot.callbackQuery(CANCEL_CALLBACK, async (ctx) => {
  ctx.session = initialSession();

  await ctx.answerCallbackQuery("Заявка отменена");
  await ctx.editMessageReplyMarkup().catch(() => undefined);
  await ctx.reply("Заявка отменена. Чтобы начать заново, отправьте /start");
});

bot.callbackQuery(Object.keys(SERVICE_CALLBACKS), async (ctx) => {
  const data = ctx.callbackQuery.data;
  const service = SERVICE_CALLBACKS[data];

  if (!service) {
    await ctx.answerCallbackQuery("Выберите один из вариантов");
    return;
  }

  ctx.session.step = "description";
  ctx.session.order.service = service;

  await ctx.answerCallbackQuery();
  await ctx.editMessageReplyMarkup().catch(() => undefined);
  await ctx.reply(descriptionMessage(service, escapeHtml), {
    parse_mode: "HTML",
    reply_markup: cancelKeyboard,
  });
});

bot.callbackQuery(Object.keys(BUDGET_CALLBACKS), async (ctx) => {
  const data = ctx.callbackQuery.data;
  const budget = BUDGET_CALLBACKS[data];

  if (!budget) {
    await ctx.answerCallbackQuery("Выберите один из вариантов");
    return;
  }

  if (ctx.session.step !== "budget") {
    await ctx.answerCallbackQuery("Сначала опишите задачу");
    return;
  }

  ctx.session.step = "contact";
  ctx.session.order.budget = budget;

  await ctx.answerCallbackQuery();
  await ctx.editMessageReplyMarkup().catch(() => undefined);
  await ctx.reply(contactMessage(ctx.session.order, escapeHtml), {
    parse_mode: "HTML",
    reply_markup: cancelKeyboard,
  });
});

bot.on("message:text", async (ctx) => {
  const text = ctx.message.text.trim();

  if (ctx.session.step === "service") {
    await ctx.reply("Пожалуйста, выберите услугу кнопкой выше 👆");
    return;
  }

  if (ctx.session.step === "description") {
    if (!text || isCommand(text)) {
      await ctx.reply(
        "Команды здесь не принимаю. Для новой заявки используйте /start, для отмены — /cancel.",
      );
      return;
    }

    ctx.session.order.description = text;
    ctx.session.step = "budget";
    await ctx.reply(budgetMessage(ctx.session.order, escapeHtml), {
      parse_mode: "HTML",
      reply_markup: budgetKeyboard,
    });
    return;
  }

  if (ctx.session.step === "budget") {
    await ctx.reply("Пожалуйста, выберите бюджет кнопкой выше 👆");
    return;
  }

  if (ctx.session.step === "contact") {
    if (!text || isCommand(text)) {
      await ctx.reply(
        "Команды здесь не принимаю. Для новой заявки используйте /start, для отмены — /cancel.",
      );
      return;
    }

    const user = ctx.from;
    const order = ctx.session.order;
    order.contact = text;

    const { service, description, budget, contact } = order;
    if (!user || !service || !description || !budget || !contact) {
      ctx.session = initialSession();
      await ctx.reply("Что-то пошло не так. Начните заново: /start");
      return;
    }

    const adminMessage = adminLeadMessage(
      { service, description, budget, contact },
      user,
      escapeHtml,
    );

    try {
      await ctx.api.sendMessage(config.adminChatId, adminMessage, {
        parse_mode: "HTML",
      });
    } catch (error) {
      console.error("Не удалось отправить заявку админу", error);
      ctx.session = initialSession();
      await ctx.reply(
        "Не удалось отправить заявку. Попробуйте ещё раз или напишите напрямую: @sib_kos",
      );
      return;
    }

    ctx.session = initialSession();
    await ctx.reply(successMessage(), { parse_mode: "HTML" });
    return;
  }

  await ctx.reply("Напишите /start чтобы оставить заявку 👇");
});

bot.catch((error) => {
  console.error("Ошибка обработки update", error);
});

async function startBot() {
  for (;;) {
    try {
      await bot.start({
        allowed_updates: allowedUpdates,
        drop_pending_updates: true,
        onStart: (botInfo) => {
          console.log(`✅ Бот @${botInfo.username} запущен`);
        },
      });
      return;
    } catch (error) {
      if (error instanceof Error && error.message.includes("401")) {
        throw error;
      }

      console.error(
        `Не удалось подключиться к Telegram, повтор через ${retryDelayMs / 1000} сек.`,
        error,
      );
      await wait(retryDelayMs);
    }
  }
}

startBot().catch((error) => {
  console.error("Не удалось запустить бота", error);
  process.exit(1);
});

process.once("SIGINT", () => bot.stop());
process.once("SIGTERM", () => bot.stop());
