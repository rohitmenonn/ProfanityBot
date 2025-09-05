
# Telegram Bot for HateSpeech Detection

Telegram bot for HateSpeech detection, the bot can delete hateful and abusive comments and messages and warn the users about their behaviour, however if the user keeps using hateful speech or abusive language the bot bans the user for a short duration as a warning.

### To add the bot to the group
- Search ```profanitator``` on telegram search bar
- Click ```Profanitator``` bot, this opens a chat with the bot
- Click on the bot name, this opens the bots additional settings
- Click the three dots at the top and invite the bot to the desired group
## Installation

To install this project on your local machine click on the ```Code``` button and download the zip folder from the options provided

![Download](https://helpdeskgeek.com/wp-content/pictures/2021/06/11CodeButtonDownloadZip.png)

Unzip the folder at your desired location and open the folder in an IDE of your choice like ```VS Code``` or ```Atom```

Open ```Command Prompt``` or ```Windows Powershell``` and navigate to the project folder run the following command

```bash
  npm install
```

## Redis Configuration

This bot now uses Redis streams to maintain and process messages. You'll need to set up Redis:

### Local Redis Setup
1. Install Redis on your system
2. Start Redis server: `redis-server`
3. The bot will connect to `redis://localhost:6379` by default

### Environment Variables
Create a `.env` file in the project root with:
```
REDIS_URL=redis://localhost:6379
```

For production, use a Redis cloud service:
```
REDIS_URL=redis://username:password@host:port
```

### Redis Streams Features
- **Message Streaming**: All messages are automatically added to Redis streams
- **Processing Tracking**: Messages are marked as processed with their analysis results
- **Statistics**: Use `/streamstats` command to view stream statistics
- **Recent Messages**: Use `/recentmessages` command to view recent messages from the stream
    
## Deployment

To get the bot online, run the following command after the previous steps are finished

```bash
  npm run start
```

Wait for the message ```DB Connection Successful```, Once that is done, the bot will now be online in all the groups and can be tested!

## Team

- [@Shresth Tiwary 19BCE2701](https://github.com/shresthhh/)
- [@Aviral Singh Chauhan 19BCE2690](https://github.com/sAVItar02)
- [@Rohit Menon 19BCE2695](https://github.com/rohitmenonn)
- [@Ananya Singh 19BCE2693](https://github.com/ananya1806)

