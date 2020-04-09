import {NewExtensionServerMessage} from "./internal/utils/message";
import {HttpUtils, get, dealHotVersion} from "./internal/utils/utils";
import {Application, Backend, Launcher} from "./internal/application";
import {ConsoleLog} from "./internal/utils/log";
import {ChromeConfigItems, NewBackendConfig} from "./internal/utils/config";
import {SystemConfig} from "./config";

class background implements Launcher {
    protected source: string;
    protected lastHotVersion: string;

    public start() {
        let server = NewExtensionServerMessage("cxmooc-tools");
        server.Accept((client, data) => {
            switch (data.type) {
                case "GM_xmlhttpRequest": {
                    HttpUtils.SendRequest(client, data);
                    break;
                }
                case "GM_notification": {
                    chrome.notifications.create({
                        title: data.details.title, message: data.details.text,
                        iconUrl: chrome.runtime.getURL("img/logo.png"), type: "basic"
                    }, (id) => {
                        if (data.details.timeout) {
                            setTimeout(() => {
                                chrome.notifications.clear(id);
                            }, data.details.timeout);
                        }
                    });
                    break;
                }
            }
        });

        this.update();
        //10分钟检查更新
        setInterval(() => {
            this.update();
        }, 10 * 60 * 1000);
        this.injectedScript();
        this.event();
        this.setDefaultConfig();
    }

    protected event() {
        if (Application.App.debug) {
            return;
        }
        chrome.runtime.onInstalled.addListener((details) => {
            if (details.reason == "install") {
                chrome.tabs.create({url: "https://cx.icodef.com/"});
            } else if (details.reason == "update") {
                chrome.tabs.create({url: "https://github.com/CodFrm/cxmooc-tools/releases"});
            }
        });
    }

    protected setDefaultConfig() {
        let configKeyList: string[] = new Array();
        for (let key in Application.App.config) {
            configKeyList.push(key);
        }
        let configDefaultValue = new Map<string, any>()
            .set("vtoken", "").set("rand_answer", false).set("auto", true)
            .set("video_mute", true).set("answer_ignore", false).set("video_cdn", "")
            .set("video_multiple", 1).set("interval", 2).set("super_mode", true);
        chrome.storage.sync.get(configKeyList, function (items) {
            configDefaultValue.forEach((val, key) => {
                if (items[key] == undefined) {
                    let tmp: { [key: string]: any; } = {};
                    tmp[key] = configDefaultValue.get(key);
                    chrome.storage.sync.set(tmp);
                }
            });
        });
    }

    protected update() {
        Application.CheckUpdate((isnew, data) => {
            let sourceUrl = chrome.extension.getURL('src/mooc.js');
            let version = SystemConfig.version;
            if (isnew) {
                chrome.browserAction.setBadgeText({
                    text: 'new'
                });
                chrome.browserAction.setBadgeBackgroundColor({
                    color: [255, 0, 0, 255]
                });
            }
            if (data == undefined) {
                if (this.source) {
                    return;
                }
                get(chrome.extension.getURL('src/mooc.js'), (source: string) => {
                    version = SystemConfig.version;
                    this.source = this.dealScript(source, SystemConfig.version);
                });
                return;
            }
            if (this.lastHotVersion == data.hotversion) {
                return;
            }
            this.lastHotVersion = data.hotversion;
            //缓存js文件源码
            let hotVersion = dealHotVersion(data.hotversion);
            let isHotUpdate: boolean = false;
            if (hotVersion > SystemConfig.version) {
                Application.App.log.Info("使用热更新版本:" + hotVersion);
                isHotUpdate = true;
            }
            if (isHotUpdate) {
                sourceUrl = SystemConfig.url + 'js/' + hotVersion + '.js';
                version = hotVersion;
            }
            (<any>get(sourceUrl, (source: string) => {
                this.source = this.dealScript(source, version);
            })).error(() => {
                if (this.source) {
                    return;
                }
                get(chrome.extension.getURL('src/mooc.js'), (source: string) => {
                    version = SystemConfig.version;
                    this.source = this.dealScript(source, SystemConfig.version);
                });
            });
        });
    }

    protected dealScript(source: string, version: any): string {
        source = "//# sourceURL=" + chrome.extension.getURL("src/mooc.js?v=" + version) + "\n" + source;
        source = source.replace(/("|\\)/g, "\\$1");
        source = source.replace(/(\r\n|\n)/g, "\\n");
        return source;
    }

    protected injectedScript() {
        if (Application.App.debug) {
            return;
        }
        let regex = new Array();
        for (let i = 0; i < SystemConfig.match.length; i++) {
            let v = SystemConfig.match[i];
            v = v.replace(/(\.\?\/)/g, "\\$1");
            v = v.replace(/\*/g, ".*?");
            regex.push(v);
        }
        chrome.runtime.onMessage.addListener((msg, details) => {
            if (!msg.status && msg.status != "loading") {
                return null;
            }
            for (let i = 0; i < regex.length; i++) {
                let reg = new RegExp(regex[i]);
                if (reg.test(details.url)) {
                    chrome.tabs.executeScript(details.tab.id, {
                        frameId: details.frameId,
                        code: `(function(){
                            let temp = document.createElement('script');
                            temp.setAttribute('type', 'text/javascript');
                            temp.innerHTML = "` + this.source + `";
                            temp.className = "injected-js";
                            document.documentElement.appendChild(temp)
                        }())`,
                        runAt: "document_start",
                    });
                    break;
                }
            }
        });
    }
}

let component = new Map<string, any>().set("logger", new ConsoleLog()).set("config", new ChromeConfigItems(NewBackendConfig()));

let application = new Application(Backend, new background(), component);
application.run();