const TelegramBot = require('node-telegram-bot-api');
const fs = require("fs");
const { exec } = require('child_process');
const config = require('./config');

const botToken = process.env.BOT_TOKEN || '';
const chat_id = process.env.GROUP_ID || '';
const commit_range = process.env.TRAVIS_COMMIT_RANGE || '';
const branch = process.env.TRAVIS_BRANCH || 'develop';
const tag = process.env.TRAVIS_TAG || false;

const tgBot = new TelegramBot(botToken, { polling: false });

exec('git log --pretty=format:"%s" ' + (branch == tag ? tag + '..' : commit_range), (err, stdout, stderr) => {
    let sendText = '';
    let end = '';
    if (branch == tag) {
        sendText += "*有一个新版本发布*\n";
        end = '\n[前去release查看](https://github.com/CodFrm/cxmooc-tools/releases)';
    } else if (branch == 'develop') {
        sendText += "*有一个内测版本发布*\n";
        end = '如果发现有什么BUG,记得[反馈](https://github.com/CodFrm/cxmooc-tools/issues)哦';
    } else if (branch == 'hotfix') {
        //热修复处理
        sendText += "*有一个bug修复,准备热更新*\n";
        sendText += hotUpdate();
    }
    sendText += "更新了以下内容:\n```" + stdout + "```\n" + end;
    tgBot.sendMessage(chat_id, sendText, { parse_mode: 'Markdown' });
    tgBot.sendDocument(chat_id, fs.createReadStream('build/cxmooc-tools.crx'));
});

function hotUpdate() {
    let ret = '热更新版本号为:' + (config.hotversion[('v' + config.version).replace('.', '_')]) + "\n";
    tgBot.sendDocument(chat_id, fs.createReadStream('build/cxmooc-tools/mooc.js'));
    tgBot.sendDocument(chat_id, fs.createReadStream('build/tampermonkey.js'));
    return ret;
}