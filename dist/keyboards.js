"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contactKeyboard = exports.budgetKeyboard = exports.serviceKeyboard = exports.BUDGET_CALLBACKS = exports.SERVICE_CALLBACKS = void 0;
const grammy_1 = require("grammy");
// Типизированные callback_data — никаких строк вручную
exports.SERVICE_CALLBACKS = {
    service_dev: "Разработка сайтов",
    service_support: "Обслуживание сайтов",
    service_seo: "SEO-продвижение сайтов",
    service_ads: "Контекстная реклама",
    service_design: "Дизайн и брендинг",
    service_smm: "SMM-продвижение",
    service_unknown: "Не знаю, посоветуйте вы",
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
    .text("🌐 Сайты", "service_dev")
    .text("🛠 Обслуживание", "service_support")
    .row()
    .text("📈 SEO", "service_seo")
    .text("🎯 Реклама", "service_ads")
    .row()
    .text("🎨 Дизайн", "service_design")
    .text("📱 SMM", "service_smm")
    .row()
    .text("❓ Не знаю, посоветуйте вы", "service_unknown");
exports.budgetKeyboard = new grammy_1.InlineKeyboard()
    .text("до 30 000 ₽", "budget_30")
    .text("30–100 000 ₽", "budget_100")
    .row()
    .text("100–300 000 ₽", "budget_300")
    .text("300 000+ ₽", "budget_300plus")
    .row()
    .text("❓ Пока не знаю", "budget_unknown");
exports.contactKeyboard = new grammy_1.Keyboard()
    .requestContact("📞 Поделиться телефоном")
    .resized()
    .oneTime();
