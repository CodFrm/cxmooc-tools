import {Config} from "./internal/utils/config";
import {NewChromeServerMessage} from "./internal/utils/message";
import {HttpUtils, Injected} from "./internal/utils/utils";

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
                        Config.SendConfig(client, data.key);
                    }
                    break;
                }
            }
        });
        this.update();
    }

    protected async update() {
        let version = await Config.GetConfig("version");
        if (version > Config.version) {
            if (await Config.GetConfig("enforce")) {
                alert('刷课扩展要求强制更新');
                window.open(await Config.GetConfig("url"));
                return;
            }
        }
        let hotVersion = await Config.GetConfig("hotversion");
        let littleVersion = hotVersion - version;
        let isHotUpdate: boolean = false;
        if (littleVersion < 0.01 && littleVersion > 0) {
            console.log('use hot update version:' + hotVersion);
            isHotUpdate = true;
        }
        if (isHotUpdate) {
            Injected(document, Config.url + 'js/' + hotVersion + '.js');
        } else {
            Injected(document, chrome.extension.getURL('src/mooc.js'));
        }
    }
}

new start().start();