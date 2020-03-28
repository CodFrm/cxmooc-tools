import {NewChromeServerMessage} from "@App/internal/utils/message";
import {HttpUtils, InjectedBySrc} from "@App/internal/utils/utils";
import {Application, Content, Launcher} from "@App/internal/application";
import {ChromeConfigItems, NewBackendConfig} from "@App/internal/utils/config";
import {ConsoleLog} from "./internal/utils/log";

class start implements Launcher {

    public async start() {
        //调试环境注入脚本
        if (Application.App.debug) {
            InjectedBySrc(document, chrome.extension.getURL('src/mooc.js'));
        } else {
            chrome.runtime.sendMessage({status: "loading"});
        }
        //注入config
        let configKeyList: string[] = new Array();
        for (let key in Application.App.config) {
            configKeyList.push(key);
        }
        chrome.storage.sync.get(configKeyList, async function (items) {
            for (let key in items) {
                if (items[key] == undefined) {
                    continue;
                }
                localStorage[key] = items[key] || await Application.App.config.GetConfig(key);
            }
        });
        //转发消息
        let msg = NewChromeServerMessage("cxmooc-tools");
        msg.Accept((client, data) => {
            switch (data.type) {
                case "GM_xmlhttpRequest": {
                    HttpUtils.SendRequest(client, data);
                    break;
                }
            }
        });
        //监听配置项更新
        chrome.runtime.onMessage.addListener((request) => {
            if (request.type && request.type == "cxconfig") {
                window.postMessage({type: "cxconfig", key: request.key, value: request.value}, '/');
            }
        });
        //检查扩展强制更新
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

let component = new Map<string, any>().set("config", new ChromeConfigItems(NewBackendConfig())).set("logger", new ConsoleLog());

let application = new Application(Content, new start(), component);
application.run();
