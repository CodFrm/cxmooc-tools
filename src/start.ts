import { Client, NewChromeServerMessage } from "@App/internal/utils/message";
import { get, HttpUtils, Injected, InjectedBySrc, Noifications, NotificationOptions } from "@App/internal/utils/utils";
import { Application, Content, Launcher } from "@App/internal/application";
import { ChromeConfigItems, NewBackendConfig } from "@App/internal/utils/config";
import { ConsoleLog } from "./internal/utils/log";
import sources = chrome.devtools.panels.sources;

class start implements Launcher {

    public async start() {
        //调试环境注入脚本
        if (Application.App.debug) {
            let cacheJsonText = JSON.stringify(await Application.App.config.ConfigList());
            get(chrome.extension.getURL('src/mooc.js'), function (source: string) {
                Injected(document, "window.configData=" + cacheJsonText + ";\n" + source);
            });
        } else {
            chrome.runtime.sendMessage({ status: "loading" });
        }
        //转发消息
        let msg = NewChromeServerMessage("cxmooc-tools");
        msg.Accept((client, data) => {
            switch (data.type) {
                case "GM_xmlhttpRequest": {
                    HttpUtils.SendRequest(client, data);
                    break;
                }
                case "GM_notification": {
                    Noifications(data.details);
                    break;
                }
                case "GM_setValue": {
                    Application.App.Client.Send({
                        type: "GM_setValue", details: data.details,
                    });
                    break;
                }
            }
        });
        //监听配置项更新
        chrome.runtime.onMessage.addListener((request) => {
            if (request.type && request.type == "cxconfig") {
                window.postMessage({ type: "cxconfig", key: request.key, value: request.value }, '/');
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

async function init() {
    let component = new Map<string, any>().set("config", new ChromeConfigItems(await NewBackendConfig())).set("logger", new ConsoleLog());

    let application = new Application(Content, new start(), component);
    application.run();
}

init();