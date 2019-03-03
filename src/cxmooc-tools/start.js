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
            'blurry_answer'
        ], function (items) {
            //设置一下配置
            if (items.blurry_answer == undefined) {
                items.blurry_answer = true;
            }
            localStorage['rand-answer'] = items.rand_answer;
            localStorage['config'] = JSON.stringify(items);
        });
        common.injected(document, chrome.extension.getURL('src/mooc.js'));
    })
}
