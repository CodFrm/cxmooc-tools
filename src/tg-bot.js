const TelegramBot = require('node-telegram-bot-api');
const fs = require("fs");
const { exec } = require('child_process');

const botToken = process.env.BOT_TOKEN || '';
const chat_id = process.env.GROUP_ID || '';
const commit_range = process.env.TRAVIS_COMMIT_RANGE || '';
const branch = process.env.TRAVIS_BRANCH || 'develop';
const tgBot = new TelegramBot(botToken, { polling: false });

exec('git log --pretty=format:"%s" ' + commit_range, (err, stdout, stderr) => {
    let sendText = '';
    let end = '';
    if (branch == 'master') {
        sendText += "*有一个新版本发布*\n";
        end = '\n[前去release查看](https://github.com/CodFrm/cxmooc-tools/releases)';
    } else {
        sendText += "*有一个内测版本发布*\n";
        end='如果发现有什么BUG,记得[反馈](https://github.com/CodFrm/cxmooc-tools/issues)哦';
    }
    sendText += "更新了以下内容:\n```" + stdout + "```" + end;
    tgBot.sendMessage(chat_id, sendText, { parse_mode: 'Markdown' });
    tgBot.sendDocument(chat_id, fs.createReadStream('build/cxmooc-tools.crx'));
});
