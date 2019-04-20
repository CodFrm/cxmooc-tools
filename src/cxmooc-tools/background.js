const moocConfig = require('../config');

//更新检测
var xhr = new XMLHttpRequest();
xhr.open("GET", moocConfig.url + 'update?ver=' + moocConfig.version, true);
xhr.onreadystatechange = function () {
    if (xhr.readyState == 4) {
        if (this.status == 200) {
            var json = JSON.parse(this.responseText);
            console.log(json);
            chrome.storage.local.set({
                'version': json.version,
                'url': json.url,
                'enforce': json.enforce,
                'hotversion': json.hotversion
            });
            if (moocConfig.version < json.version) {
                chrome.browserAction.setBadgeText({
                    text: 'new'
                });
                chrome.browserAction.setBadgeBackgroundColor({
                    color: [255, 0, 0, 255]
                });
            }
        } else {
            chrome.storage.local.set({
                'version': moocConfig.version,
                'url': moocConfig.url,
                'enforce': moocConfig.enforce,
                'hotversion': moocConfig.version,
            });
        }
    }
}
xhr.send();

//监听消息
chrome.runtime.onConnect.addListener(function (port) {
    if (port.name != 'tools') {
        return;
    }
    port.onMessage.addListener(function (request) {
        switch (request.type) {
            case 'GM_xmlhttpRequest': {
                request.param.onreadystatechange = function (req) {
                    req.event = 'onreadystatechange';
                    req.type = 'GM_xmlhttpRequest';
                    port.postMessage(req);
                }
                GM_xmlhttpRequest(request.param);
                break;
            }
        }
    });
});

function GM_xmlhttpRequest(request) {
    var xhr = new XMLHttpRequest();
    xhr.open(request.method, request.url, true);
    for (let key in request.headers) {
        xhr.setRequestHeader(key, request.headers[key]);
    }
    xhr.onreadystatechange = function () {
        request.onreadystatechange && request.onreadystatechange({
            readyState: xhr.readyState,
            status: xhr.status,
            responseText: xhr.responseText,
        });
    }
    xhr.send(request.data || '');
}