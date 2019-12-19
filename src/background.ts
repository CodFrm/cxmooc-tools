import {Config} from './internal/utils/config'
import {NewExtensionServerMessage} from "./internal/utils/message";
import {HttpUtils} from "./internal/utils/utils";

class background {

    public start() {
        let server = NewExtensionServerMessage("cxmooc-tools");
        server.Accept((client, data) => {
            switch (data.type) {
                case "GM_xmlhttpRequest": {
                    HttpUtils.SendRequest(client, data);
                    break;
                }
            }
        });
        this.update();
    }


    protected update() {
        HttpUtils.HttpGet(Config.url + "update?ver=" + Config.version, {
            json: true,
            success: function (json) {
                console.log(json);
                chrome.storage.local.set({
                    'version': json.version,
                    'url': json.url,
                    'enforce': json.enforce,
                    'hotversion': json.hotversion
                });
                if (Config.version < json.version) {
                    chrome.browserAction.setBadgeText({
                        text: 'new'
                    });
                    chrome.browserAction.setBadgeBackgroundColor({
                        color: [255, 0, 0, 255]
                    });
                }
            }
        })
    }

}

new background().start();
