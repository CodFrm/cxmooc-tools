const moocConfig = require('../config');
window.onload = function () {
    document.getElementById('version').innerHTML = 'v' + moocConfig.version.toString();
    var xhr = new XMLHttpRequest();
    xhr.open("GET", moocConfig.url + 'update', true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            if (this.status == 200) {
                var json = JSON.parse(this.responseText);
                if (moocConfig.version < json.version) {
                    var p = document.createElement('p');
                    p.style.color = "#ff0000";
                    p.innerHTML = '有新的版本更新:<a href="' + json.url + '" style="float:right;" target="_blank">点我去下载</a>  最新版本:v' + json.version;
                    document.getElementsByTagName('body')[0].appendChild(p);
                }
                document.getElementById("injection").innerHTML = json.injection
            } else {
                document.getElementById("tiku").src = "https://img.shields.io/badge/%E9%A2%98%E5%BA%93-error-red.svg"
            }
        }
    }
    xhr.send();
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
    });

    chrome.storage.sync.get('video_multiple', function (items) {
        document.getElementById('video-multiple').value = items.video_multiple == undefined ? 1 : items.video_multiple;
    });

    document.getElementById('answer-ignore').onclick = function () {
        chrome.storage.sync.set({
            'answer_ignore': document.getElementById('answer-ignore').checked
        });
        return true;
    }

    document.getElementById('rand-answer').onclick = function () {
        chrome.storage.sync.set({
            'rand_answer': document.getElementById('rand-answer').checked
        });
        return true;
    }

    document.getElementById('video-mute').onclick = function () {
        chrome.storage.sync.set({
            'video_mute': document.getElementById('video-mute').checked
        });
        return true;
    }

    document.getElementById('auto').onchange = function () {
        check = document.getElementById('auto');
        if (check.checked) {
            document.getElementById('auto-m').style.display = 'inline-block';
            document.getElementById('ignore').style.display = '';
        } else {
            document.getElementById('auto-m').style.display = 'none';
            document.getElementById('ignore').style.display = 'none';
        }
        chrome.storage.sync.set({
            'auto': check.checked
        });
    }
    document.getElementById('interval').onblur = function () {
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
        chrome.storage.sync.set({
            'video_multiple': document.getElementById('video-multiple').value
        });
    }
}