const moocConfig = require('../config');
const common = require('./common');

window.onload = function () {
    //注入mooc.js
    chrome.storage.local.get(['version', 'url', 'enforce', 'hotversion'], function (items) {
        console.log(items);
        let serverConfig = items;
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
            items.video_mute = items.video_mute == undefined ? true : items.video_mute;
            items.auto = items.auto == undefined ? true : items.auto;
            //设置一下配置
            localStorage['config'] = JSON.stringify(items);
            console.log(items);
            //热更新处理
            let littleVersion = serverConfig.hotversion - moocConfig.version
            if (serverConfig.hotversion == moocConfig.version) {
                localStorage.removeItem('hot_version');
            }
            let isHotUpdate = localStorage['hot_version'];
            if (littleVersion < 0.01 && littleVersion > 0) {
                //切换热更新
                console.log('use hot update version:' + serverConfig.hotversion);
                isHotUpdate = serverConfig.hotversion;
                localStorage['hot_version'] = serverConfig.hotversion;
            }
            if (isHotUpdate) {
                //拥有一个热更新版本
                common.injected(document, moocConfig.url + 'js/' + isHotUpdate + '.js');
            } else {
                common.injected(document, chrome.extension.getURL('src/mooc.js'));
            }
        });
    })
}
