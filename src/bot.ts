import "dotenv/config";
import { Bot, session } from "grammy";
import { SocksProxyAgent } from "socks-proxy-agent";
import { config } from "./config.js";
import type { BotContext, BotSession, OrderData } from "./types.js";
import {
  BUDGET_CALLBACKS,
  SERVICE_CALLBACKS,
  budgetKeyboard,
  contactKeyboard,
  serviceKeyboard,
} from "./keyboards.js";
import {
  adminLeadMessage,
  budgetMessage,
  contactMessage,
  descriptionMessage,
  successMessage,
  welcomeMessage,
} from "./messages.js";

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

async function submitOrder(ctx: BotContext, contact: string) {
  const user = ctx.from;
  const order = ctx.session.order;
  order.contact = contact;

  const { service, description, budget } = order;
  if (!user || !service || !description || !budget || !contact) {
    ctx.session = initialSession();
    await ctx.reply("Что-то пошло не так. Начните заново: /start", {
      reply_markup: { remove_keyboard: true },
    });
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
      { reply_markup: { remove_keyboard: true } },
    );
    return;
  }

  ctx.session = initialSession();
  await ctx.reply(successMessage(), {
    parse_mode: "HTML",
    reply_markup: { remove_keyboard: true },
  });
}

bot.use(session({ initial: initialSession }));

bot.command("start", startOrder);

bot.command("cancel", async (ctx) => {
  ctx.session = initialSession();
  await ctx.reply("Заявка отменена. Чтобы начать заново, отправьте /start");
});

bot.on("callback_query:data", async (ctx) => {
  const data = ctx.callbackQuery.data;

  const service = SERVICE_CALLBACKS[data];

  if (service) {
    ctx.session.step = "description";
    ctx.session.order.service = service;

    await ctx.answerCallbackQuery();
    await ctx
      .editMessageText(descriptionMessage(service, escapeHtml), {
        parse_mode: "HTML",
      })
      .catch(async () => {
        await ctx.reply(descriptionMessage(service, escapeHtml), {
          parse_mode: "HTML",
        });
      });
    return;
  }

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
  await ctx
    .editMessageText(contactMessage(ctx.session.order, escapeHtml), {
      parse_mode: "HTML",
    })
    .catch(async () => {
      await ctx.reply(contactMessage(ctx.session.order, escapeHtml), {
        parse_mode: "HTML",
      });
    });
  await ctx.reply("Можно отправить номер одной кнопкой:", {
    reply_markup: contactKeyboard,
  });
});

bot.on("message:contact", async (ctx) => {
  if (ctx.session.step !== "contact") {
    await ctx.reply("Напишите /start чтобы оставить заявку 👇", {
      reply_markup: { remove_keyboard: true },
    });
    return;
  }

  const contact = ctx.message.contact;
  const fullName = [contact.first_name, contact.last_name].filter(Boolean).join(" ");
  const phone = contact.phone_number;

  await submitOrder(ctx, fullName ? `${fullName}, ${phone}` : phone);
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

    await submitOrder(ctx, text);
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
