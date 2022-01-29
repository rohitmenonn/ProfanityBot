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

/* Todo: 

1. Welcome message when users join
2. Proper timeout message
3. Diff timeouts for hateful, abusive etc. (optional)
4. DM to owner when users repeat toxic behaviour (optional)

*/

bot.on('text', (ctx) => {
  // Explicit usage
  if(ctx.message.text == "toxic"){
    ctx.reply('Message deleted!');
    // Results in perma timeout as of now, needs fix.
    var timeout = ctx.message.date + 120;
    ctx.restrictChatMember(ctx.message.chat.id, {user_id: ctx.message.from.id}, {can_send_messages: false}, timeout).catch(e => console.log(e)); 
    ctx.deleteMessage(ctx.message.message_id, ctx.message.chat.id).catch(e => console.log(e));
  } 
  console.log(ctx.message, ctx.state);
  // Using context shortcut
});

bot.launch();
