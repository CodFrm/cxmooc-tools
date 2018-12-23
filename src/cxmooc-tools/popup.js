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
            }
        }
    }
    xhr.send();
    chrome.storage.sync.get('rand_answer', function (items) {
        document.getElementById('rand-answer').checked = items.rand_answer;
    });
    chrome.storage.sync.get('interval', function (items) {
        document.getElementById('interval').value = items.interval == undefined ? 5 : items.interval;
    });
    chrome.storage.sync.get('auto', function (items) {
        document.getElementById('auto').checked = items.auto;
        document.getElementById('auto').onchange();
    });
    chrome.storage.sync.get('video_mute', function (items) {
        document.getElementById('video-mute').checked = items.video_mute;
        document.getElementById('video-mute').onchange();
    });

    chrome.storage.sync.get('video_multiple', function (items) {
        document.getElementById('video-multiple').value = items.video_multiple == undefined ? 1 : items.video_multiple;
    });

    chrome.storage.sync.get('answer_ignore', function (items) {
        document.getElementById('answer-ignore').checked = items.answer_ignore;
        document.getElementById('answer-ignore').onchange();
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
        chrome.storage.sync.set({
            'video_multiple': document.getElementById('video-multiple').value
        });
    }
}