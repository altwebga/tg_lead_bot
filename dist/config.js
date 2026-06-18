"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const { BOT_TOKEN, ADMIN_CHAT_ID } = process.env;
if (!BOT_TOKEN) {
    throw new Error("BOT_TOKEN не задан в .env");
}
const parsedAdminChatId = Number(ADMIN_CHAT_ID);
if (!ADMIN_CHAT_ID || !Number.isFinite(parsedAdminChatId)) {
    throw new Error("ADMIN_CHAT_ID должен быть числом в .env");
}
exports.config = {
    botToken: BOT_TOKEN,
    adminChatId: parsedAdminChatId,
};
