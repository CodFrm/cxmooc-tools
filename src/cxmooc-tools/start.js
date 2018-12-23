const moocConfig = require('../config');

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
        document.head.setAttribute('chrome-url', chrome.extension.getURL(''));
        chrome.storage.sync.get([
            'rand_answer',
            'interval',
            'auto',
            'video_mute',
            'answer_ignore',
            'video_multiple'
        ], function (items) {
            //设置一下配置
            console.log(items);
            document.head.setAttribute('rand-answer', items.rand_answer);
            localStorage['config'] = JSON.stringify(items);
        });
        chrome.storage.local.get([
            'topic_regx',
            'topics',
            'topic_time'
        ], function (items) {
            //读取题库信息
            if (localStorage['topic_time'] == undefined || items.topic_time == undefined || localStorage['topic_time'] < items.topic_time) {
                localStorage['topic_regx'] = items.topic_regx;
                localStorage['topics'] = items.topics;
                localStorage['topic_time'] = items.topic_time;
            }
        });
        injected(document, 'mooc.js');
    })
}

function injected(doc, file) {
    var path = 'src/' + file;
    var temp = doc.createElement('script');
    temp.setAttribute('type', 'text/javascript');
    temp.src = chrome.extension.getURL(path);
    doc.head.appendChild(temp);
}