const moocConfig = require('../config');

//更新检测
var xhr = new XMLHttpRequest();
xhr.open("GET", moocConfig.url + 'update', true);
xhr.onreadystatechange = function () {
    if (xhr.readyState == 4) {
        if (this.status == 200) {
            var json = JSON.parse(this.responseText);
            console.log(json);
            chrome.storage.local.set({
                'version': json.version,
                'url': json.url,
                'enforce': json.enforce
            });
            if (moocConfig.version < json.version) {
                chrome.browserAction.setBadgeText({
                    text: 'new'
                });
                chrome.browserAction.setBadgeBackgroundColor({
                    color: [255, 0, 0, 255]
                });
            }
        }
    }
}
xhr.send();