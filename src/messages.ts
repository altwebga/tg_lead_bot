import type { OrderData } from "./types.js";

type Escape = (value: string) => string;

export function welcomeMessage(): string {
  return (
    "<b>Заявка на digital-услуги</b>\n\n" +
    "Помогу быстро зафиксировать задачу и передать её специалисту.\n\n" +
    "<b>Шаг 1 из 4</b>\n" +
    "Что нужно сделать?"
  );
}

export function descriptionMessage(service: string, escape: Escape): string {
  return (
    `<b>Выбрано:</b> ${escape(service)}\n\n` +
    "<b>Шаг 2 из 4</b>\n" +
    "Опишите задачу или проект. Можно коротко: что есть сейчас и какой результат нужен."
  );
}

export function budgetMessage(order: OrderData, escape: Escape): string {
  return (
    "<b>Короткая сводка</b>\n\n" +
    `<b>Услуга:</b> ${escape(order.service ?? "-")}\n` +
    `<b>Задача:</b> ${escape(order.description ?? "-")}\n\n` +
    "<b>Шаг 3 из 4</b>\n" +
    "Выберите примерный бюджет."
  );
}

export function contactMessage(order: OrderData, escape: Escape): string {
  return (
    "<b>Почти готово</b>\n\n" +
    `<b>Услуга:</b> ${escape(order.service ?? "-")}\n` +
    `<b>Бюджет:</b> ${escape(order.budget ?? "-")}\n\n` +
    "<b>Шаг 4 из 4</b>\n" +
    "Оставьте телефон или нажмите кнопку ниже, чтобы поделиться контактом."
  );
}

export function adminLeadMessage(
  order: Required<OrderData>,
  user: {
    first_name: string;
    last_name?: string;
    username?: string;
  },
  escape: Escape,
): string {
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ");
  const username = user.username ? `@${user.username}` : "не указан";

  return (
    "🔔 <b>Новая заявка</b>\n\n" +
    `<b>Клиент:</b> ${escape(fullName)} (${escape(username)})\n` +
    `<b>Услуга:</b> ${escape(order.service)}\n` +
    `<b>Бюджет:</b> ${escape(order.budget)}\n\n` +
    "<b>Задача:</b>\n" +
    `${escape(order.description)}\n\n` +
    "<b>Контакт:</b>\n" +
    escape(order.contact)
  );
}

export function successMessage(): string {
  return (
    "✅ <b>Заявка принята</b>\n\n" +
    "Спасибо! Мы посмотрим задачу и вернёмся с первыми вопросами в течение 1 рабочего дня.\n\n" +
    "<b>Что дальше:</b>\n" +
    "• уточним детали\n" +
    "• предложим подход\n" +
    "• сориентируем по срокам и бюджету\n\n" +
    "Если срочно — напишите напрямую: @sib_kos"
  );
}
