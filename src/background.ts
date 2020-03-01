import { NewExtensionServerMessage } from "./internal/utils/message";
import { HttpUtils, get } from "./internal/utils/utils";
import { Application, Backend, Launcher } from "./internal/application";
import { ConsoleLog } from "./internal/utils/log";
import { SystemConfig } from "./internal/utils/config";


class background implements Launcher {

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
        this.setDefaultConfig();
    }

    protected setDefaultConfig() {
        let configKeyList: string[] = new Array();
        for (let key in Application.App.config) {
            configKeyList.push(key);
        }
        let configDefaultValue = new Map<string, any>().
            set("vtoken", "").set("rand_answer", false).set("auto", true).
            set("video_mute", true).set("answer_ignore", false).set("video_cdn", "").
            set("video_multiple", 1).set("interval", 1).set("super_mode", true);

        chrome.storage.sync.get(configKeyList, function (items) {
            for (let key in items) {
                if (items[key] == undefined) {
                    chrome.storage.sync.set(key, configDefaultValue.get(key));
                }
            }
        });
    }

    protected update() {
        Application.CheckUpdate(function (isnew, data) {
            let sourceUrl = chrome.extension.getURL('src/mooc.js');
            if (isnew) {
                chrome.browserAction.setBadgeText({
                    text: 'new'
                });
                chrome.browserAction.setBadgeBackgroundColor({
                    color: [255, 0, 0, 255]
                });
            }
            //缓存js文件源码
            let hotVersion = data.hotversion;
            let littleVersion = hotVersion - data.version;
            let isHotUpdate: boolean = false;
            if (littleVersion < 0.01 && littleVersion > 0) {
                Application.App.log.Info("使用热更新版本:" + hotVersion);
                isHotUpdate = true;
            }
            if (isHotUpdate) {
                sourceUrl = SystemConfig.url + 'js/' + hotVersion + '.js';
            }
            get(sourceUrl, function (source: string) {
                if(!source){
                    return ;
                }
                chrome.storage.local.set({ "source": source });
            });
        });
    }
}

let component = new Map<string, any>().
    set("logger", new ConsoleLog());

let application = new Application(Backend, new background(), component);
application.run();