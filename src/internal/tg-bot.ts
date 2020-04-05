import {SystemConfig} from "../config";

const TelegramBot = require('node-telegram-bot-api');
const fs = require("fs");
const {exec} = require('child_process');
const request = require('request');
const botToken = process.env.BOT_TOKEN || '';
const chat_id = process.env.GROUP_ID || '';
const commit_range = process.env.TRAVIS_COMMIT_RANGE || '';
const branch = process.env.TRAVIS_BRANCH || 'develop';
const tag = process.env.TRAVIS_TAG || false;
const qqgrouptoken = (process.env.QQGROUP_TOKEN || '').split(',');

const tgBot = new TelegramBot(botToken, {polling: false});

let lastTag = '';
if (branch == tag) {
    //获取上一个tag
    exec('git describe --tags HEAD^^', (err: any, stdout: { toString: () => string; }, stderr: any) => {
        let match = stdout.toString().match(/([v\.\d]+)-/);
        lastTag = match[1];
        push();
    });
} else {
    push();
}

function push() {
    let range = commit_range;
    if (branch == tag) {
        range = tag + '...' + lastTag;
    }
    exec('git log --pretty=format:"%s" ' + range + (range.search('.') < 0 ? ' -1' : ''), (err: any, stdout: string, stderr: any) => {
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
        sendText += "更新了以下内容:\n```\n" + stdout + "\n```\n" + end;
        console.log(sendText);
        tgBot.sendMessage(chat_id, sendText, {parse_mode: 'Markdown'});
        tgBot.sendDocument(chat_id, fs.createReadStream('build/cxmooc-tools.crx'));
        //send qq group
        let content = new Array();
        let t = sendText.split("m/");
        content.push({type: 0, data: t[0]});
        t.forEach((v, k) => {
            if (k == 0) {
                return;
            }
            content.push({
                type: 0,
                data: "m/" + v
            });
        });
        for (let i = 0; i < qqgrouptoken.length; i++) {
            request({
                url: qqgrouptoken[i],
                method: "POST",
                body: '{"content":' + JSON.stringify(content) + '}',
            }, function (a1: any) {
                console.log(a1);
            });
        }
    });
}

function hotUpdate() {
    let ret = '热更新版本号为:' + (SystemConfig.hotVersion) + "\n";
    return ret;
}