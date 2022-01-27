import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });
const bot = new Telegraf(process.env.BOT_TOKEN);

// create /start command
bot.start((ctx) => {
  ctx.reply(`Hi ${ctx.message.chat.first_name} ! Welcome to Profanity Bot`);
});

bot.on('sticker', (ctx) => ctx.reply("Don't send me stickers noob!"));

bot.on('text', (ctx) => {
  // Explicit usage

  console.log(ctx.message, ctx.state);
  // Using context shortcut
  ctx.reply(`Testing!`);
});

bot.launch();
