"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.budgetKeyboard = exports.serviceKeyboard = exports.BUDGET_CALLBACKS = exports.SERVICE_CALLBACKS = void 0;
const grammy_1 = require("grammy");
// Типизированные callback_data — никаких строк вручную
exports.SERVICE_CALLBACKS = {
    service_dev: "Разработка сайта",
    service_seo: "SEO и продвижение",
    service_fix: "Доработка сайта",
    service_all: "Комплекс услуг",
};
exports.BUDGET_CALLBACKS = {
    budget_30: "до 30 000 ₽",
    budget_100: "30–100 000 ₽",
    budget_300: "100–300 000 ₽",
    budget_300plus: "300 000+ ₽",
    budget_unknown: "Не знаю",
};
exports.serviceKeyboard = new grammy_1.InlineKeyboard()
    .text("🌐 Разработка сайта", "service_dev")
    .row()
    .text("📈 SEO / реклама", "service_seo")
    .row()
    .text("🔧 Доработка сайта", "service_fix")
    .row()
    .text("📦 Всё сразу", "service_all");
exports.budgetKeyboard = new grammy_1.InlineKeyboard()
    .text("до 30 000 ₽", "budget_30")
    .text("30–100 000 ₽", "budget_100")
    .row()
    .text("100–300 000 ₽", "budget_300")
    .text("300 000+ ₽", "budget_300plus")
    .row()
    .text("❓ Не знаю", "budget_unknown");
