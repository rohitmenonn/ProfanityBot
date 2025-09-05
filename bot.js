const mongoose = require("mongoose");
const pkg = require("telegraf");
const { Telegraf } = pkg;
const dotenv = require("dotenv");
const User = require("./user.js");
const fetch = require("node-fetch");
const { createClient } = require("redis");

const BOT_TOKEN = `5010757011:AAFPBzl-PudMGn738lCdD2ntfhSunuJvWfs`;

const DB = `mongodb+srv://admin:91LM007sT256cKVE@profanitator.yjuzp.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

// Redis configuration
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const MESSAGE_STREAM = 'telegram:messages';
const PROCESSED_STREAM = 'telegram:processed';

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("DB connection successful!"));

dotenv.config({ path: ".env" });

// Initialize Redis client
const redisClient = createClient({
  url: REDIS_URL
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.on('connect', () => console.log('Redis connection successful!'));

// Connect to Redis
redisClient.connect().catch(console.error);

const bot = new Telegraf(BOT_TOKEN);

let prevMessageId = null;

// Redis Stream Helper Functions
async function addMessageToStream(messageData) {
  try {
    const streamData = {
      messageId: messageData.message_id,
      chatId: messageData.chat.id,
      userId: messageData.from.id,
      username: messageData.from.username || 'unknown',
      firstName: messageData.from.first_name || 'unknown',
      text: messageData.text,
      timestamp: Date.now(),
      processed: 'false'
    };
    
    await redisClient.xAdd(MESSAGE_STREAM, '*', streamData);
    console.log('Message added to Redis stream:', messageData.message_id);
  } catch (error) {
    console.error('Error adding message to stream:', error);
  }
}

async function markMessageAsProcessed(messageId, chatId, result) {
  try {
    const processedData = {
      messageId: messageId,
      chatId: chatId,
      result: result,
      processedAt: Date.now()
    };
    
    await redisClient.xAdd(PROCESSED_STREAM, '*', processedData);
    console.log('Message marked as processed:', messageId);
  } catch (error) {
    console.error('Error marking message as processed:', error);
  }
}

async function getUnprocessedMessages() {
  try {
    const messages = await redisClient.xRead({
      key: MESSAGE_STREAM,
      id: '0'
    });
    return messages;
  } catch (error) {
    console.error('Error reading from stream:', error);
    return null;
  }
}

function deletePreviousMessage(prevMessageId, chatID, currentMessageID) {
  if (prevMessageId) {
    ctx.deleteMessage(prevMessageId, chatID).catch((e) => console.log(e));
    console.log("Reached here");
  }
  prevMessageId = currentMessageID;
}

// create /start command
bot.start((ctx) => {
  ctx.reply(`Hi ${ctx.message.from.first_name}! Welcome to Profanity Bot`);
  deletePreviousMessage(
    prevMessageId,
    ctx.message.chat.id,
    ctx.message.message_id
  );
});

bot.on("sticker", (ctx) => ctx.reply("Don't send me stickers noob!"));

bot.on("/unban", (ctx) => {
  console.log(ctx.message);
  ctx.reply("UNderstood");
});

/* Todo: 

1. Welcome message when users join
2. Proper timeout message
3. Diff timeouts for hateful, abusive etc. (optional)
4. DM to owner when users repeat toxic behaviour (optional)

*/

bot.on("text", async (ctx) => {
  // Add message to Redis stream first
  await addMessageToStream(ctx.message);
  
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
      // Mark as processed (new user, no analysis needed)
      await markMessageAsProcessed(ctx.message.message_id, ctx.message.chat.id, 'new_user');
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
        console.log(prevMessageId);
        deletePreviousMessage(
          prevMessageId,
          ctx.message.chat.id,
          ctx.message.message_id
        );
        // Mark as processed with ban result
        await markMessageAsProcessed(ctx.message.message_id, ctx.message.chat.id, 'hate_speech_banned');
      } else {
        // Mark as processed with warning result
        await markMessageAsProcessed(ctx.message.message_id, ctx.message.chat.id, 'hate_speech_warning');
      }
      ctx.reply(`Hate Speech Detected 🚫⛔
      User: ${ctx.message.from.username}
      Number of Warnings: ${currentUser.numberWarnings}
      Message Deleted
      `);
      ctx
        .deleteMessage(ctx.message.message_id, ctx.message.chat.id)
        .catch((e) => console.log(e));
      deletePreviousMessage(
        prevMessageId,
        ctx.message.chat.id,
        ctx.message.message_id
      );
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

        deletePreviousMessage(
          prevMessageId,
          ctx.message.chat.id,
          ctx.message.message_id
        );
        // Mark as processed with ban result
        await markMessageAsProcessed(ctx.message.message_id, ctx.message.chat.id, 'offensive_banned');
      } else {
        // Mark as processed with warning result
        await markMessageAsProcessed(ctx.message.message_id, ctx.message.chat.id, 'offensive_warning');
      }
      ctx.reply(`Abusive/Offensive Language Detected 🚫⛔
      User: ${ctx.message.from.username}
      Number of Warnings: ${currentUser.numberWarnings}
      Message Deleted
      `);
      ctx
        .deleteMessage(ctx.message.message_id, ctx.message.chat.id)
        .catch((e) => console.log(e));

      deletePreviousMessage(
        prevMessageId,
        ctx.message.chat.id,
        ctx.message.message_id
      );
    } else {
      // Mark as processed (clean message)
      await markMessageAsProcessed(ctx.message.message_id, ctx.message.chat.id, 'clean_message');
    }
    await currentUser.save();
  }
});

// Stream Consumer Function (for background processing)
async function processMessageStream() {
  try {
    const messages = await redisClient.xRead({
      key: MESSAGE_STREAM,
      id: '0',
      block: 1000 // Block for 1 second if no messages
    });
    
    if (messages && messages.length > 0) {
      for (const stream of messages) {
        for (const message of stream.messages) {
          console.log('Processing stream message:', message.id, message.message);
          // Here you can add additional processing logic
          // For example: analytics, logging, notifications, etc.
        }
      }
    }
  } catch (error) {
    console.error('Error processing message stream:', error);
  }
}

// Command to view stream statistics
bot.command('streamstats', async (ctx) => {
  try {
    const messageCount = await redisClient.xLen(MESSAGE_STREAM);
    const processedCount = await redisClient.xLen(PROCESSED_STREAM);
    
    ctx.reply(`📊 Stream Statistics:
📨 Total Messages: ${messageCount}
✅ Processed Messages: ${processedCount}
⏳ Pending: ${messageCount - processedCount}`);
  } catch (error) {
    console.error('Error getting stream stats:', error);
    ctx.reply('Error retrieving stream statistics');
  }
});

// Command to view recent messages from stream
bot.command('recentmessages', async (ctx) => {
  try {
    const messages = await redisClient.xRevRange(MESSAGE_STREAM, '+', '-', { COUNT: 5 });
    
    if (messages.length === 0) {
      ctx.reply('No recent messages found in stream');
      return;
    }
    
    let response = '📋 Recent Messages:\n\n';
    messages.forEach((msg, index) => {
      response += `${index + 1}. User: ${msg.message.username}\n`;
      response += `   Text: ${msg.message.text.substring(0, 50)}${msg.message.text.length > 50 ? '...' : ''}\n`;
      response += `   Time: ${new Date(parseInt(msg.message.timestamp)).toLocaleString()}\n\n`;
    });
    
    ctx.reply(response);
  } catch (error) {
    console.error('Error getting recent messages:', error);
    ctx.reply('Error retrieving recent messages');
  }
});

// Start stream processing (optional - runs in background)
// Uncomment the line below if you want automatic stream processing
// setInterval(processMessageStream, 5000); // Process every 5 seconds

bot.launch();
