const TelegramBot = require('node-telegram-bot-api');
const fs = require("fs");

let botToken = process.env.BOT_TOKEN || '783996793:AAFj97WfPZFIlTjy3r_JbuYTzJ--rqIIf58';
let chat_id = process.env.GROUP_ID || '812989466';

const tgBot = new TelegramBot(botToken, { polling: false });

// tgBot.sendDocument(chat_id, fs.createReadStream('build/cxmooc-tools.crx'));
let sendText = "*有一个新版本发布*\n \
\
";
tgBot.sendMessage(chat_id, sendText, { parse_mode: 'Markdown' });
