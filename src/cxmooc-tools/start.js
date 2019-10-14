const moocConfig = require('../config');
const common = require('./common');

(function () {
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
            'vtoken', 'video_cdn',
            'is_ruokuai', 'ruokuai_user', 'ruokuai_pwd'
        ], function (items) {
            items.video_cdn = items.video_cdn;
            items.interval = items.interval >= 0 ? items.interval : 5;
            items.rand_answer = items.rand_answer || false;
            items.video_multiple = items.video_multiple || 1;
            items.video_mute = items.video_mute == undefined ? true : items.video_mute;
            items.auto = items.auto == undefined ? true : items.auto;
            //热更新处理
            let littleVersion = serverConfig.hotversion - moocConfig.version
            let isHotUpdate = false;
            if (littleVersion < 0.01 && littleVersion > 0) {
                //切换热更新
                console.log('use hot update version:' + serverConfig.hotversion);
                isHotUpdate = serverConfig.hotversion;
            }
            //设置一下配置
            items.vtoken = items.vtoken || 'user|' + (isHotUpdate || moocConfig.version);
            localStorage['config'] = JSON.stringify(items);
            console.log(items);
            if (isHotUpdate) {
                //拥有一个热更新版本
                common.injected(document, moocConfig.url + 'js/' + isHotUpdate + '.js');
            } else {
                common.injected(document, chrome.extension.getURL('src/mooc.js'));
            }
        });
    })
})();

//实现GM_xmlhttpRequest(兼容油猴),完成跨域
common.serverMessage('GM_xmlhttpRequest', function (param, sendResponse) {
    //向background发送消息
    let connect = chrome.runtime.connect({ name: 'tools' });
    connect.postMessage({ type: "GM_xmlhttpRequest", param: param });
    connect.onMessage.addListener(function (response) {
        if (response.type == 'GM_xmlhttpRequest') {
            sendResponse(response);
        }
    });
});

//监听配置改动
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.type && request.type == 'config') {
        common.clientMessage('cxconfig').send(request);
    }
});
