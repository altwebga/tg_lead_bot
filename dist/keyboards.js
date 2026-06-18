"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelKeyboard = exports.budgetKeyboard = exports.serviceKeyboard = exports.BUDGET_CALLBACKS = exports.SERVICE_CALLBACKS = exports.CANCEL_CALLBACK = void 0;
const grammy_1 = require("grammy");
exports.CANCEL_CALLBACK = "cancel_order";
// Типизированные callback_data — никаких строк вручную
exports.SERVICE_CALLBACKS = {
    service_dev: "Разработка сайтов",
    service_support: "Обслуживание сайтов",
    service_seo: "SEO-продвижение сайтов",
    service_ads: "Контекстная реклама",
    service_design: "Дизайн и брендинг",
    service_smm: "SMM-продвижение",
    service_fix: "Обслуживание сайтов",
    service_all: "Разработка сайтов",
};
exports.BUDGET_CALLBACKS = {
    budget_30: "до 30 000 ₽",
    budget_100: "30–100 000 ₽",
    budget_300: "100–300 000 ₽",
    budget_300plus: "300 000+ ₽",
    budget_unknown: "Не знаю",
};
exports.serviceKeyboard = new grammy_1.InlineKeyboard()
    .text("🌐 Разработка сайтов", "service_dev")
    .row()
    .text("🛠 Обслуживание сайтов", "service_support")
    .row()
    .text("📈 SEO-продвижение", "service_seo")
    .row()
    .text("🎯 Контекстная реклама", "service_ads")
    .row()
    .text("🎨 Дизайн и брендинг", "service_design")
    .row()
    .text("📱 SMM-продвижение", "service_smm");
exports.budgetKeyboard = new grammy_1.InlineKeyboard()
    .text("до 30 000 ₽", "budget_30")
    .text("30–100 000 ₽", "budget_100")
    .row()
    .text("100–300 000 ₽", "budget_300")
    .text("300 000+ ₽", "budget_300plus")
    .row()
    .text("❓ Пока не знаю", "budget_unknown")
    .row()
    .text("✕ Отменить заявку", exports.CANCEL_CALLBACK);
exports.cancelKeyboard = new grammy_1.InlineKeyboard().text("✕ Отменить заявку", exports.CANCEL_CALLBACK);
