import { Context, Scenes } from "telegraf";

// Услуги которые предлагает агентство
export type ServiceType =
  | "Разработка сайта"
  | "SEO и продвижение"
  | "Доработка сайта"
  | "Комплекс услуг";

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

// Сессия wizard-сцены с нашими данными
export interface OrderWizardSession extends Scenes.WizardSessionData {
  order: OrderData;
}

// Расширяем сессию Telegraf
export interface BotSession extends Scenes.WizardSession<OrderWizardSession> {
  order?: OrderData; // добавь ?
}

// Контекст бота с нашей сессией
export type BotContext = Context & {
  session: BotSession;
  scene: Scenes.SceneContextScene<BotContext, OrderWizardSession>;
  wizard: Scenes.WizardContextWizard<BotContext>;
};
