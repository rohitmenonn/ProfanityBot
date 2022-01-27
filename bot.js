import pkg from 'telegraf';
const { Telegraf } = pkg;
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });
const bot = new Telegraf(process.env.BOT_TOKEN);

// create /start command
bot.start((ctx) => {
  ctx.reply(`Hi ${ctx.message.from.first_name}! Welcome to Profanity Bot`);
});

bot.on('sticker', (ctx) => ctx.reply("Don't send me stickers noob!"));

bot.on('text', (ctx) => {
  // Explicit usage
  if(ctx.message.text == "toxic"){
    ctx.reply('Message deleted! You are toxic.');
    // ctx.restrictChatMember(ctx.message.chat.id, ctx.message.from.id, {can_send_messages: false}, ctx.message.date + 400); 
    ctx.deleteMessage(ctx.message.message_id, ctx.message.chat.id);
  } 

  console.log(ctx.message, ctx.state);
  // Using context shortcut
});

bot.launch();
