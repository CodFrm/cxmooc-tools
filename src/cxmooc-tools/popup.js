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
    document.getElementById('rand-answer').onclick = function () {
        chrome.storage.sync.set({
            'rand_answer': document.getElementById('rand-answer').checked
        });
        return true;
    }
    document.getElementById('auto').onchange = function () {
        check = document.getElementById('auto');
        if (check.checked) {
            document.getElementById('auto-m').style.display = 'inline-block';
        } else {
            document.getElementById('auto-m').style.display = 'none';
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
}