import "dotenv/config";
import { Telegraf, Scenes, session } from "telegraf";
import { BotContext } from "./types";
import { orderWizard } from "./scenes/order";
import { config } from "./config";

const bot = new Telegraf<BotContext>(config.botToken);

const stage = new Scenes.Stage<BotContext>([orderWizard]);

bot.use(session({ defaultSession: () => ({ order: {} }) }));
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
