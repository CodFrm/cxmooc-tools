import { NewChromeServerMessage } from "@App/internal/utils/message";
import { HttpUtils, Injected, randNumber } from "@App/internal/utils/utils";
import { Application, Content, Launcher } from "@App/internal/application";
import { SystemConfig, ChromeConfigItems, NewFrontendGetConfig } from "@App/internal/utils/config";
import { ConsoleLog } from "./internal/utils/log";

class start implements Launcher {

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
                Application.App.log.Info("使用热更新版本:" + hotVersion);
                isHotUpdate = true;
            }
            //注入config
            let configKeyList: string[] = new Array();
            for (let key in Application.App.config) {
                configKeyList.push(key);
            }
            chrome.storage.sync.get(configKeyList, function (items) {
                for (let key in items) {
                    if (items[key] == undefined) { continue; }
                    localStorage[key] = items[key] || Application.App.config.get(key);
                }
                if (isHotUpdate) {
                    Injected(document, SystemConfig.url + 'js/' + hotVersion + '.js');
                } else {
                    Injected(document, chrome.extension.getURL('src/mooc.js'));
                }
            });
        });
    }
}

let component = new Map<string, any>().
    set("config", new ChromeConfigItems(NewFrontendGetConfig())).
    set("logger", new ConsoleLog());

let application = new Application(Content, new start(), component);
application.run();