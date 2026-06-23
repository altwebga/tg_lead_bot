import { InlineKeyboard, Keyboard } from "grammy";
// Типизированные callback_data — никаких строк вручную
export const SERVICE_CALLBACKS = {
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
export const BUDGET_CALLBACKS = {
    budget_30: "до 30 000 ₽",
    budget_100: "30–100 000 ₽",
    budget_300: "100–300 000 ₽",
    budget_300plus: "300 000+ ₽",
    budget_unknown: "Не знаю",
};
export const serviceKeyboard = new InlineKeyboard()
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
export const budgetKeyboard = new InlineKeyboard()
    .text("до 30 000 ₽", "budget_30")
    .text("30–100 000 ₽", "budget_100")
    .row()
    .text("100–300 000 ₽", "budget_300")
    .text("300 000+ ₽", "budget_300plus")
    .row()
    .text("❓ Пока не знаю", "budget_unknown");
export const contactKeyboard = new Keyboard()
    .requestContact("📞 Поделиться телефоном")
    .resized()
    .oneTime();
