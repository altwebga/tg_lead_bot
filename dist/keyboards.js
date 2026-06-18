"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.budgetKeyboard = exports.serviceKeyboard = exports.BUDGET_CALLBACKS = exports.SERVICE_CALLBACKS = void 0;
// Типизированные callback_data — никаких строк вручную
exports.SERVICE_CALLBACKS = {
    service_dev: 'Разработка сайта',
    service_seo: 'SEO и продвижение',
    service_fix: 'Доработка сайта',
    service_all: 'Комплекс услуг',
};
exports.BUDGET_CALLBACKS = {
    budget_30: 'до 30 000 ₽',
    budget_100: '30–100 000 ₽',
    budget_300: '100–300 000 ₽',
    budget_300plus: '300 000+ ₽',
    budget_unknown: 'Не знаю',
};
exports.serviceKeyboard = {
    inline_keyboard: [
        [{ text: '🌐 Разработка сайта', callback_data: 'service_dev' }],
        [{ text: '📈 SEO / реклама', callback_data: 'service_seo' }],
        [{ text: '🔧 Доработка сайта', callback_data: 'service_fix' }],
        [{ text: '📦 Всё сразу', callback_data: 'service_all' }],
    ],
};
exports.budgetKeyboard = {
    inline_keyboard: [
        [
            { text: 'до 30 000 ₽', callback_data: 'budget_30' },
            { text: '30–100 000 ₽', callback_data: 'budget_100' },
        ],
        [
            { text: '100–300 000 ₽', callback_data: 'budget_300' },
            { text: '300 000+ ₽', callback_data: 'budget_300plus' },
        ],
        [{ text: '❓ Не знаю', callback_data: 'budget_unknown' }],
    ],
};
