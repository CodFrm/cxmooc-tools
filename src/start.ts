import { NewChromeServerMessage } from "@App/internal/utils/message";
import { HttpUtils, Injected, randNumber, get } from "@App/internal/utils/utils";
import { Application, Content, Launcher } from "@App/internal/application";
import { SystemConfig, ChromeConfigItems, NewFrontendGetConfig, NewBackendConfig } from "@App/internal/utils/config";
import { ConsoleLog } from "./internal/utils/log";

class start implements Launcher {

    public async start() {
        //注入config
        let configKeyList: string[] = new Array();
        for (let key in Application.App.config) {
            configKeyList.push(key);
        }
        chrome.storage.sync.get(configKeyList, async function (items) {
            for (let key in items) {
                if (items[key] == undefined) { continue; }
                localStorage[key] = items[key] || await Application.App.config.GetConfig(key);
            }
            Application.App.log.Debug("注入脚本", document.URL);
            if (Application.App.debug) {
                await get(chrome.extension.getURL('src/mooc.js'), async function (source: string) {
                    await chrome.storage.local.set({ "source": source });
                });
            }
            Injected(document, "source");
        });
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
        });
    }
}

let component = new Map<string, any>().
    set("config", new ChromeConfigItems(NewBackendConfig())).
    set("logger", new ConsoleLog());

let application = new Application(Content, new start(), component);
application.run();