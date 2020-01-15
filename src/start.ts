import {NewChromeServerMessage} from "./internal/utils/message";
import {HttpUtils, Injected} from "./internal/utils/utils";
import {CheckUpdate} from "./internal/application";
import {SystemConfig} from "./internal/utils/config";

class start {

    public start() {
        let msg = NewChromeServerMessage("cxmooc-tools");
        msg.Accept((client, data) => {
            switch (data.type) {
                case "GM_xmlhttpRequest": {
                    HttpUtils.SendRequest(client, data);
                    break;
                }
                case "config": {
                    if (data.key) {
                        SystemConfig.SendConfig(client, data.key);
                    }
                    break;
                }
            }
        });
        CheckUpdate((isnew, data) => {
            if (isnew) {
                if (data.enforce) {
                    alert('刷课扩展要求强制更新');
                    window.open(data.url);
                    return;
                }
            }
            let hotVersion = data.hotversion;
            let littleVersion = hotVersion - data.version;
            let isHotUpdate: boolean = false;
            if (littleVersion < 0.01 && littleVersion > 0) {
                console.log('use hot update version:' + hotVersion);
                isHotUpdate = true;
            }
            if (isHotUpdate) {
                Injected(document, SystemConfig.url + 'js/' + hotVersion + '.js');
            } else {
                Injected(document, chrome.extension.getURL('src/mooc.js'));
            }
        });
    }
}

new start().start();