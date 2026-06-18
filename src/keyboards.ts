import { InlineKeyboard } from "grammy";
import { ServiceType, BudgetType } from "./types";

export const CANCEL_CALLBACK = "cancel_order";

// Типизированные callback_data — никаких строк вручную
export const SERVICE_CALLBACKS: Record<string, ServiceType> = {
  service_dev: "Разработка сайтов",
  service_support: "Обслуживание сайтов",
  service_seo: "SEO-продвижение сайтов",
  service_ads: "Контекстная реклама",
  service_design: "Дизайн и брендинг",
  service_smm: "SMM-продвижение",
  service_fix: "Обслуживание сайтов",
  service_all: "Разработка сайтов",
};

export const BUDGET_CALLBACKS: Record<string, BudgetType> = {
  budget_30: "до 30 000 ₽",
  budget_100: "30–100 000 ₽",
  budget_300: "100–300 000 ₽",
  budget_300plus: "300 000+ ₽",
  budget_unknown: "Не знаю",
};

export const serviceKeyboard = new InlineKeyboard()
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

export const budgetKeyboard = new InlineKeyboard()
  .text("до 30 000 ₽", "budget_30")
  .text("30–100 000 ₽", "budget_100")
  .row()
  .text("100–300 000 ₽", "budget_300")
  .text("300 000+ ₽", "budget_300plus")
  .row()
  .text("❓ Пока не знаю", "budget_unknown")
  .row()
  .text("✕ Отменить заявку", CANCEL_CALLBACK);

export const cancelKeyboard = new InlineKeyboard().text(
  "✕ Отменить заявку",
  CANCEL_CALLBACK,
);
