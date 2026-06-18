"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const telegraf_1 = require("telegraf");
const order_1 = require("./scenes/order");
const config_1 = require("./config");
const bot = new telegraf_1.Telegraf(config_1.config.botToken);
const stage = new telegraf_1.Scenes.Stage([order_1.orderWizard]);
bot.use((0, telegraf_1.session)({ defaultSession: () => ({ order: {} }) }));
bot.use(stage.middleware());
bot.start((ctx) => ctx.scene.enter("order_wizard"));
bot.on("message", async (ctx) => {
    await ctx.reply("Напишите /start чтобы оставить заявку 👇");
});
bot
    .launch()
    .then(() => {
    console.log("✅ Бот запущен");
})
    .catch((error) => {
    console.error("Не удалось запустить бота", error);
    process.exit(1);
});
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
