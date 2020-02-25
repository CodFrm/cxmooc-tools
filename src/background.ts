import { NewExtensionServerMessage } from "./internal/utils/message";
import { HttpUtils } from "./internal/utils/utils";
import { Application, Backend, Launcher } from "./internal/application";
import { ConsoleLog } from "./internal/utils/log";


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
        Application.CheckUpdate(function (isnew, data) {
            if (isnew) {
                chrome.browserAction.setBadgeText({
                    text: 'new'
                });
                chrome.browserAction.setBadgeBackgroundColor({
                    color: [255, 0, 0, 255]
                });
            }
        });

        let configKeyList: string[] = new Array();
        for (let key in Application.App.config) {
            configKeyList.push(key);
        }
        let configDefaultValue = new Map<string, any>().
            set("vtoken", "").set("rand_answer", false).set("auto", true).
            set("video_mute", true).set("answer_ignore", false).set("video_cdn", "").
            set("video_multiple", 1).set("interval", 1);

        chrome.storage.sync.get(configKeyList, function (items) {
            for (let key in items) {
                if (items[key] == undefined) {
                    chrome.storage.sync.set(key, configDefaultValue.get(key));
                }
            }
        });
    }
}

let component = new Map<string, any>().
    set("logger", new ConsoleLog());

let application = new Application(Backend, new background(), component);
application.run();