const mongoose = require("mongoose");
const pkg = require("telegraf");
const { Telegraf } = pkg;
const dotenv = require("dotenv");
const User = require("./user.js");
const fetch = require("node-fetch");

const BOT_TOKEN = `5010757011:AAFPBzl-PudMGn738lCdD2ntfhSunuJvWfs`;

const DB = `mongodb+srv://admin:91LM007sT256cKVE@profanitator.yjuzp.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("DB connection successful!"));

dotenv.config({ path: ".env" });
const bot = new Telegraf(BOT_TOKEN);

// create /start command
bot.start((ctx) => {
  ctx.reply(`Hi ${ctx.message.from.first_name}! Welcome to Profanity Bot`);
});

bot.on("sticker", (ctx) => ctx.reply("Don't send me stickers noob!"));

/* Todo: 

1. Welcome message when users join
2. Proper timeout message
3. Diff timeouts for hateful, abusive etc. (optional)
4. DM to owner when users repeat toxic behaviour (optional)

*/

bot.on("text", async (ctx) => {
  const user = await User.findOne({ id: ctx.message.from.id });
  if (user === null) {
    try {
      const newUser = new User({
        id: ctx.message.from.id,
        fname: ctx.message.from.first_name,
        username: ctx.message.from.username,
        numberMessages: 1,
        numberWarnings: 0,
      });
      await newUser.save();
      console.log("User Saved");
    } catch (e) {
      console.log(e);
    }
  } else {
    const currentUser = await User.findOne({ id: ctx.message.from.id });
    currentUser.numberMessages++;
    const response = await fetch(
      `http://nlp1310.herokuapp.com/predict-review?review=${ctx.message.text}`
    );
    const prediction = await response.json();
    console.log(ctx.message);
    if (prediction.Prediction == "Hate Speech") {
      currentUser.numberWarnings++;
      if (currentUser.numberWarnings >= 5) {
        ctx
          .restrictChatMember(
            ctx.message.chat.id,
            { user_id: ctx.message.from.id },
            { can_send_messages: false },
            Math.round(Date.now() / 1000) + 60
          )
          .catch((e) => console.log(e));
        ctx.reply(`Warnings limit reached
        Number of warnings: ${currentUser.numberWarnings}
        Banned ${currentUser.username}
        Message Deleted
        `);
      }
      console.log(Math.round(Date.now() / 1000) + 31);
      ctx.reply(`Hate Speech Detected 🚫⛔
      User: ${ctx.message.from.username}
      Number of Warnings: ${currentUser.numberWarnings}
      Message Deleted
      `);
      ctx
        .deleteMessage(ctx.message.message_id, ctx.message.chat.id)
        .catch((e) => console.log(e));
    } else if (prediction.Prediction == "Offensive Language") {
      currentUser.numberWarnings++;
      if (currentUser.numberWarnings >= 5) {
        ctx
          .restrictChatMember(
            ctx.message.chat.id,
            { user_id: ctx.message.from.id },
            { can_send_messages: false },
            Math.round(Date.now() / 1000) + 60
          )
          .catch((e) => console.log(e));
        ctx.reply(`Warnings limit reached
        Number of warnings: ${currentUser.numberWarnings}
        Banned ${currentUser.username}
        Message Deleted
        `);
      }
      ctx.reply(`Abusive/Offensive Language Detected 🚫⛔
      User: ${ctx.message.from.username}
      Number of Warnings: ${currentUser.numberWarnings}
      Message Deleted
      `);
      ctx
        .deleteMessage(ctx.message.message_id, ctx.message.chat.id)
        .catch((e) => console.log(e));
    }
    await currentUser.save();
  }
});

bot.launch();
