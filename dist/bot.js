"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const grammy_1 = require("grammy");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { SocksProxyAgent } = require("socks-proxy-agent");
const config_1 = require("./config");
const keyboards_1 = require("./keyboards");
const apiTimeoutMs = 20000;
const retryDelayMs = 5000;
const allowedUpdates = ["message", "callback_query"];
const agent = config_1.config.proxyUrl
    ? new SocksProxyAgent(config_1.config.proxyUrl, { timeout: apiTimeoutMs })
    : undefined;
const bot = new grammy_1.Bot(config_1.config.botToken, {
    client: {
        baseFetchConfig: agent ? { agent: agent } : undefined,
    },
});
function initialSession() {
    return { step: "idle", order: {} };
}
function escapeHtml(value) {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}
function isCommand(value) {
    return value.startsWith("/");
}
function resetOrder(ctx) {
    ctx.session.step = "service";
    ctx.session.order = {};
    return ctx.session.order;
}
function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
async function startOrder(ctx) {
    resetOrder(ctx);
    await ctx.reply("👋 Привет! Я помогу оставить заявку на разработку или продвижение сайта.\n\nЧто вас интересует?", { reply_markup: keyboards_1.serviceKeyboard });
}
bot.use((0, grammy_1.session)({ initial: initialSession }));
bot.command("start", startOrder);
bot.command("cancel", async (ctx) => {
    ctx.session = initialSession();
    await ctx.reply("Заявка отменена. Чтобы начать заново, отправьте /start");
});
bot.callbackQuery(Object.keys(keyboards_1.SERVICE_CALLBACKS), async (ctx) => {
    const data = ctx.callbackQuery.data;
    const service = keyboards_1.SERVICE_CALLBACKS[data];
    if (!service) {
        await ctx.answerCallbackQuery("Выберите один из вариантов");
        return;
    }
    ctx.session.step = "description";
    ctx.session.order.service = service;
    await ctx.answerCallbackQuery();
    await ctx.editMessageReplyMarkup().catch(() => undefined);
    await ctx.reply(`✅ Выбрано: <b>${escapeHtml(service)}</b>`, {
        parse_mode: "HTML",
    });
    await ctx.reply("📝 Опишите вашу задачу или проект (пара слов — достаточно):");
});
bot.callbackQuery(Object.keys(keyboards_1.BUDGET_CALLBACKS), async (ctx) => {
    const data = ctx.callbackQuery.data;
    const budget = keyboards_1.BUDGET_CALLBACKS[data];
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
    await ctx.reply(`✅ Бюджет: <b>${escapeHtml(budget)}</b>`, {
        parse_mode: "HTML",
    });
    await ctx.reply("📞 Оставьте контакт: имя и телефон или @username в Telegram:");
});
bot.on("message:text", async (ctx) => {
    const text = ctx.message.text.trim();
    if (ctx.session.step === "service") {
        await ctx.reply("Пожалуйста, выберите услугу кнопкой выше 👆");
        return;
    }
    if (ctx.session.step === "description") {
        if (!text || isCommand(text)) {
            await ctx.reply("Команды здесь не принимаю. Для новой заявки используйте /start, для отмены — /cancel.");
            return;
        }
        ctx.session.order.description = text;
        ctx.session.step = "budget";
        await ctx.reply("💰 Примерный бюджет?", { reply_markup: keyboards_1.budgetKeyboard });
        return;
    }
    if (ctx.session.step === "budget") {
        await ctx.reply("Пожалуйста, выберите бюджет кнопкой выше 👆");
        return;
    }
    if (ctx.session.step === "contact") {
        if (!text || isCommand(text)) {
            await ctx.reply("Команды здесь не принимаю. Для новой заявки используйте /start, для отмены — /cancel.");
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
        const adminMessage = `🔔 <b>Новая заявка!</b>\n\n` +
            `👤 От: ${escapeHtml(user.first_name)} ${escapeHtml(user.last_name ?? "")} (@${escapeHtml(user.username ?? "нет")})\n` +
            `🛠 Услуга: ${escapeHtml(service)}\n` +
            `📋 Задача: ${escapeHtml(description)}\n` +
            `💰 Бюджет: ${escapeHtml(budget)}\n` +
            `📞 Контакт: ${escapeHtml(contact)}`;
        try {
            await ctx.api.sendMessage(config_1.config.adminChatId, adminMessage, {
                parse_mode: "HTML",
            });
        }
        catch (error) {
            console.error("Не удалось отправить заявку админу", error);
            ctx.session = initialSession();
            await ctx.reply("Не удалось отправить заявку. Попробуйте ещё раз или напишите напрямую: @sib_kos");
            return;
        }
        ctx.session = initialSession();
        await ctx.reply("✅ Заявка принята! Свяжемся с вами в течение 1 рабочего дня.\n\n" +
            "Если срочно — напишите напрямую: @sib_kos");
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
        }
        catch (error) {
            if (error instanceof Error && error.message.includes("401")) {
                throw error;
            }
            console.error(`Не удалось подключиться к Telegram, повтор через ${retryDelayMs / 1000} сек.`, error);
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
