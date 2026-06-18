"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderWizard = void 0;
const telegraf_1 = require("telegraf");
const keyboards_1 = require("../keyboards");
const config_1 = require("../config");
function escapeHtml(value) {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}
function isCommand(value) {
    return value.startsWith("/");
}
function getOrder(ctx) {
    const state = ctx.wizard.state;
    if (!state.order)
        state.order = {};
    return state.order;
}
exports.orderWizard = new telegraf_1.Scenes.WizardScene("order_wizard", 
// Шаг 1 — выбор услуги
async (ctx) => {
    ctx.wizard.state.order = {};
    await ctx.reply("👋 Привет! Я помогу оставить заявку на разработку или продвижение сайта.\n\nЧто вас интересует?", { reply_markup: keyboards_1.serviceKeyboard });
    return ctx.wizard.next();
}, 
// Шаг 2 — обработка услуги, запрос описания
async (ctx) => {
    if (!ctx.callbackQuery || !("data" in ctx.callbackQuery)) {
        await ctx.reply("Пожалуйста, выберите услугу кнопкой выше 👆");
        return;
    }
    const data = ctx.callbackQuery.data;
    if (!(data in keyboards_1.SERVICE_CALLBACKS)) {
        await ctx.answerCbQuery("Выберите один из вариантов");
        return;
    }
    const order = getOrder(ctx);
    order.service = keyboards_1.SERVICE_CALLBACKS[data];
    await ctx.answerCbQuery();
    await ctx.editMessageReplyMarkup(undefined);
    await ctx.reply(`✅ Выбрано: <b>${order.service}</b>`, {
        parse_mode: "HTML",
    });
    await ctx.reply("📝 Опишите вашу задачу или проект (пара слов — достаточно):");
    return ctx.wizard.next();
}, 
// Шаг 3 — обработка описания, запрос бюджета
async (ctx) => {
    if (!ctx.message || !("text" in ctx.message)) {
        await ctx.reply("Пожалуйста, напишите описание текстом");
        return;
    }
    const order = getOrder(ctx);
    if (isCommand(ctx.message.text)) {
        await ctx.reply("Команды здесь не принимаю. Для новой заявки используйте /start, для отмены — /cancel.");
        return;
    }
    const description = ctx.message.text.trim();
    if (!description) {
        await ctx.reply("Пожалуйста, напишите описание текстом");
        return;
    }
    order.description = description;
    await ctx.reply("💰 Примерный бюджет?", { reply_markup: keyboards_1.budgetKeyboard });
    return ctx.wizard.next();
}, 
// Шаг 4 — обработка бюджета, запрос контакта
async (ctx) => {
    if (!ctx.callbackQuery || !("data" in ctx.callbackQuery)) {
        await ctx.reply("Пожалуйста, выберите бюджет кнопкой выше 👆");
        return;
    }
    const data = ctx.callbackQuery.data;
    if (!(data in keyboards_1.BUDGET_CALLBACKS)) {
        await ctx.answerCbQuery("Выберите один из вариантов");
        return;
    }
    const order = getOrder(ctx);
    order.budget = keyboards_1.BUDGET_CALLBACKS[data];
    await ctx.answerCbQuery();
    await ctx.editMessageReplyMarkup(undefined);
    await ctx.reply(`✅ Бюджет: <b>${order.budget}</b>`, {
        parse_mode: "HTML",
    });
    await ctx.reply("📞 Оставьте контакт: имя и телефон или @username в Telegram:");
    return ctx.wizard.next();
}, 
// Шаг 5 — получение контакта и отправка заявки
async (ctx) => {
    if (!ctx.message || !("text" in ctx.message)) {
        await ctx.reply("Пожалуйста, напишите контакт текстом");
        return;
    }
    const user = ctx.from;
    if (!user) {
        await ctx.reply("Не удалось определить пользователя. Попробуйте снова: /start");
        return ctx.scene.leave();
    }
    const order = getOrder(ctx);
    if (isCommand(ctx.message.text)) {
        await ctx.reply("Команды здесь не принимаю. Для новой заявки используйте /start, для отмены — /cancel.");
        return;
    }
    const contactText = ctx.message.text.trim();
    if (!contactText) {
        await ctx.reply("Пожалуйста, напишите контакт текстом");
        return;
    }
    order.contact = contactText;
    const { service, description, budget, contact } = order;
    if (!service || !description || !budget || !contact) {
        await ctx.reply("Что-то пошло не так. Начните заново: /start");
        return ctx.scene.leave();
    }
    const adminMessage = `🔔 <b>Новая заявка!</b>\n\n` +
        `👤 От: ${escapeHtml(user.first_name)} ${escapeHtml(user.last_name ?? "")} (@${escapeHtml(user.username ?? "нет")})\n` +
        `🛠 Услуга: ${escapeHtml(service)}\n` +
        `📋 Задача: ${escapeHtml(description)}\n` +
        `💰 Бюджет: ${escapeHtml(budget)}\n` +
        `📞 Контакт: ${escapeHtml(contact)}`;
    try {
        await ctx.telegram.sendMessage(config_1.config.adminChatId, adminMessage, {
            parse_mode: "HTML",
        });
    }
    catch (error) {
        console.error("Не удалось отправить заявку админу", error);
        await ctx.reply("Не удалось отправить заявку. Попробуйте ещё раз или напишите напрямую: @sib_kos");
        return ctx.scene.leave();
    }
    await ctx.reply("✅ Заявка принята! Свяжемся с вами в течение 1 рабочего дня.\n\n" +
        "Если срочно — напишите напрямую: @sib_kos");
    return ctx.scene.leave();
});
exports.orderWizard.command("start", async (ctx) => {
    await ctx.scene.reenter();
});
exports.orderWizard.command("cancel", async (ctx) => {
    await ctx.reply("Заявка отменена. Чтобы начать заново, отправьте /start");
    return ctx.scene.leave();
});
