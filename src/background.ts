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
                case "GM_setValue": {
                    Application.App.config.SetConfig(data.details.key, data.details.val);
                    break;
                }
            }
        });
        this.update();
        //1小时检查更新
        setInterval(() => {
            this.update();
        }, 60 * 60 * 1000);
        this.injectedScript();
        this.event();
        this.menu();
    }

    protected menu() {
        chrome.contextMenus.create({
            title: "使用 网课小工具 搜索题目",
            contexts: ["selection"],
            onclick: function (info, tab) {
                chrome.tabs.create({url: "https://cx.icodef.com/query.html?q=" + encodeURIComponent(info.selectionText)});
            }
        });
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
        return this.dealSymbol(source);
    }

    protected dealSymbol(source: string): string {
        source = source.replace(/("|\\)/g, "\\$1");
        source = source.replace(/(\r\n|\n)/g, "\\n");
        return source;
    }

    protected async injectedScript() {
        if (Application.App.debug) {
            return;
        }
        let regex = new Array();
        for (let key in SystemConfig.match) {
            for (let i = 0; i < SystemConfig.match[key].length; i++) {
                let v = SystemConfig.match[key][i];
                v = v.replace(/(\.\?\/)/g, "\\$1");
                v = v.replace(/\*/g, ".*?");
                regex.push(v);
            }
        }
        let cache = await Application.App.config.ConfigList();
        let cacheJsonText = JSON.stringify(cache);
        Application.App.config.Watch("*", function (key: string, value: string) {
            cache[key] = value;
            cacheJsonText = JSON.stringify(cache);
        });
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
                            temp.innerHTML = "` + this.dealSymbol("window.configData=" + cacheJsonText + "\n") + this.source + `";
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

async function init() {
    let component = new Map<string, any>().set("logger", new ConsoleLog()).set("config", new ChromeConfigItems(await NewBackendConfig()));

    let application = new Application(Backend, new background(), component);
    application.run();
}

init();