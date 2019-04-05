const moocConfig = require('../config');
const common = require('./common');

window.onload = function () {
    //注入mooc.js
    chrome.storage.local.get(['version', 'url', 'enforce'], function (items) {
        if (items.version > moocConfig.version) {
            if (items.enforce) {
                alert('刷课扩展要求强制更新');
                window.open(items.url);
                return;
            }
        }
        localStorage['chrome-url'] = chrome.extension.getURL('');
        chrome.storage.sync.get([
            'rand_answer',
            'interval',
            'auto',
            'video_mute',
            'answer_ignore',
            'video_multiple',
        ], function (items) {
            items.interval = items.interval >= 0 ? items.interval : 5;
            items.rand_answer = items.rand_answer || false;
            items.video_multiple = items.video_multiple || 1;
            items.video_mute =  items.video_mute == undefined ? true : items.video_mute;
            items.auto = items.auto == undefined ? true : items.auto;
            //设置一下配置
            localStorage['rand-answer'] = items.rand_answer;
            localStorage['config'] = JSON.stringify(items);
            console.log(items);
            common.injected(document, chrome.extension.getURL('src/mooc.js'));
        });
    })
}
