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
        injected(document, 'mooc.js');
        document.head.setAttribute('chrome-url', chrome.extension.getURL(''));
    })
}

function injected(doc, file) {
    var path = 'src/' + file;
    var temp = doc.createElement('script');
    temp.setAttribute('type', 'text/javascript');
    temp.src = chrome.extension.getURL(path);
    doc.head.appendChild(temp);
}