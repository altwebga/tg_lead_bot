import { InlineKeyboard } from "grammy";
import { ServiceType, BudgetType } from "./types";

// Типизированные callback_data — никаких строк вручную
export const SERVICE_CALLBACKS: Record<string, ServiceType> = {
  service_dev: "Разработка сайта",
  service_seo: "SEO и продвижение",
  service_fix: "Доработка сайта",
  service_all: "Комплекс услуг",
};

export const BUDGET_CALLBACKS: Record<string, BudgetType> = {
  budget_30: "до 30 000 ₽",
  budget_100: "30–100 000 ₽",
  budget_300: "100–300 000 ₽",
  budget_300plus: "300 000+ ₽",
  budget_unknown: "Не знаю",
};

export const serviceKeyboard = new InlineKeyboard()
  .text("🌐 Разработка сайта", "service_dev")
  .row()
  .text("📈 SEO / реклама", "service_seo")
  .row()
  .text("🔧 Доработка сайта", "service_fix")
  .row()
  .text("📦 Всё сразу", "service_all");

export const budgetKeyboard = new InlineKeyboard()
  .text("до 30 000 ₽", "budget_30")
  .text("30–100 000 ₽", "budget_100")
  .row()
  .text("100–300 000 ₽", "budget_300")
  .text("300 000+ ₽", "budget_300plus")
  .row()
  .text("❓ Не знаю", "budget_unknown");
