import { Context, SessionFlavor } from "grammy";

// Услуги которые предлагает агентство
export type ServiceType =
  | "Разработка сайтов"
  | "Обслуживание сайтов"
  | "SEO-продвижение сайтов"
  | "Контекстная реклама"
  | "Дизайн и брендинг"
  | "SMM-продвижение"
  | "Не знаю, посоветуйте вы";

// Варианты бюджета
export type BudgetType =
  | "до 30 000 ₽"
  | "30–100 000 ₽"
  | "100–300 000 ₽"
  | "300 000+ ₽"
  | "Не знаю";

// Данные заявки — всё строго типизировано
export interface OrderData {
  service?: ServiceType;
  description?: string;
  budget?: BudgetType;
  contact?: string;
}

export type OrderStep = "idle" | "service" | "description" | "budget" | "contact";

export interface BotSession {
  step: OrderStep;
  order: OrderData;
}

export type BotContext = Context & SessionFlavor<BotSession>;
