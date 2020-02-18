import { NewChromeServerMessage } from "@App/internal/utils/message";
import { HttpUtils, Injected } from "@App/internal/utils/utils";
import { Application, Content } from "@App/internal/application";
import { SystemConfig } from "@App/internal/utils/config";

new Application(Content);
class start {

    public main() {
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
        Application.CheckUpdate((isnew, data) => {
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

new start().main();