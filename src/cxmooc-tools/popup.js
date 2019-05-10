const moocConfig = require('../config');
const common = require('./common');

window.onload = function () {
    let edit = document.getElementsByClassName('edit');
    for (let i = 0; i < edit.length; i++) {
        edit[i].onblur = function () {
            sendConfig(edit[i].getAttribute('config-key'), edit[i].value);
            chrome.storage.sync.set({
                [edit[i].getAttribute('config-key')]: edit[i].value
            });
        }
        chrome.storage.sync.get(edit[i].getAttribute('config-key'), function (items) {
            edit[i].value = items[edit[i].getAttribute('config-key')] || '';
        });
    }

    let check = document.getElementsByClassName('check');
    for (let i = 0; i < check.length; i++) {
        check[i].onchange = function () {
            sendConfig(check[i].getAttribute('config-key'), check[i].checked);
            chrome.storage.sync.set({
                [check[i].getAttribute('config-key')]: check[i].checked
            });
        }
        chrome.storage.sync.get(check[i].getAttribute('config-key'), function (items) {
            check[i].checked = items[check[i].getAttribute('config-key')] || false;
        });
    }

    document.getElementById('version').innerHTML = 'v' + moocConfig.version.toString();
    common.gm_get(moocConfig.url + 'update?ver=' + moocConfig.version, function (data) {
        var json = JSON.parse(data);
        chrome.storage.local.set({
            'version': json.version,
            'url': json.url,
            'enforce': json.enforce,
            'hotversion': json.hotversion
        });
        if (moocConfig.version < json.version) {
            var p = document.createElement('p');
            p.style.color = "#ff0000";
            p.innerHTML = '有新的版本更新:<a href="' + json.url + '" style="float:right;" target="_blank">点我去下载</a>  最新版本:v' + json.version;
            document.getElementsByTagName('body')[0].appendChild(p);
        }
        document.getElementById("injection").innerHTML = json.injection
        document.getElementById('version').innerHTML = 'v' + (moocConfig.version > json.hotversion ? moocConfig.version : json.hotversion);
    }).error(function () {
        chrome.storage.local.set({
            'version': moocConfig.version,
            'url': moocConfig.url,
            'enforce': moocConfig.enforce,
            'hotversion': moocConfig.version,
        });
        document.getElementById("tiku").src = "https://img.shields.io/badge/%E9%A2%98%E5%BA%93-error-red.svg"
    });

    document.getElementById('dama').onclick = function () {
        document.getElementById('dama-config').style.height = document.getElementById('dama-config').style.height == '90px' ? '0' : '90px';
    }

    chrome.storage.sync.get(['rand_answer', 'video_mute', 'answer_ignore'], function (items) {
        document.getElementById('video-mute').checked = (items.video_mute == undefined ? true : items.video_mute);
        delete items.video_mute;
        for (item in items) {
            document.getElementById(item.replace('_', '-')).checked = items[item];
        }
    });

    chrome.storage.sync.get('interval', function (items) {
        document.getElementById('interval').value = items.interval == undefined ? 5 : items.interval;
    });

    chrome.storage.sync.get('auto', function (items) {
        document.getElementById('auto').checked = (items.auto == undefined ? true : items.auto);
        document.getElementById('auto').onchange();
    });

    chrome.storage.sync.get('video_multiple', function (items) {
        document.getElementById('video-multiple').value = items.video_multiple == undefined ? 1 : items.video_multiple;
    });

    document.getElementById('answer-ignore').onclick = function () {
        sendConfig('answer_ignore', document.getElementById('answer-ignore').checked);
        chrome.storage.sync.set({
            'answer_ignore': document.getElementById('answer-ignore').checked
        });
        return true;
    }

    document.getElementById('rand-answer').onclick = function () {
        sendConfig('rand_answer', document.getElementById('rand-answer').checked);
        chrome.storage.sync.set({
            'rand_answer': document.getElementById('rand-answer').checked
        });
        return true;
    }

    document.getElementById('video-mute').onclick = function () {
        sendConfig('video_mute', document.getElementById('video-mute').checked);
        chrome.storage.sync.set({
            'video_mute': document.getElementById('video-mute').checked
        });
        return true;
    }

    document.getElementById('auto').onchange = function () {
        let check = document.getElementById('auto');
        if (check.checked) {
            document.getElementById('auto-m').style.display = 'inline-block';
            document.getElementById('ignore').style.display = '';
        } else {
            document.getElementById('auto-m').style.display = 'none';
            document.getElementById('ignore').style.display = 'none';
        }
        sendConfig('auto', check.checked);
        chrome.storage.sync.set({
            'auto': check.checked
        });
    }
    document.getElementById('interval').onblur = function () {
        sendConfig('interval', document.getElementById('interval').value);
        chrome.storage.sync.set({
            'interval': document.getElementById('interval').value
        });
    }
    document.getElementById('video-multiple').onblur = function () {
        if (localStorage['boom_multiple'] == undefined || localStorage['boom_multiple'] != 1) {
            let msg = prompt('这是一个很危险的功能,建议不要进行调整,如果你想调整播放速度请在下方填写yes')
            if (msg === null || msg !== 'yes') {
                document.getElementById('video-multiple').value = 1;
                return;
            } else {
                localStorage['boom_multiple'] = 1;
            }
        }
        sendConfig('video_multiple', document.getElementById('video-multiple').value);
        chrome.storage.sync.set({
            'video_multiple': document.getElementById('video-multiple').value
        });
    }
}

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

//即时同步配置
function sendConfig(key, value) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        for (let i = 0; i < tabs.length; i++) {
            chrome.tabs.sendMessage(tabs[i].id, { type: 'config', 'key': key, 'value': value });
        }
    });
}
