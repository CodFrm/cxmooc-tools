import { boolToString, randNumber, toBool } from "./utils";
import { Application } from "../application";
import { SystemConfig } from "@App/config";

export interface ConfigItems extends Config {
    SetNamespace(namespace: string): void

    SetNamespaceConfig(namespace: string, key: string, val: string): Promise<any>

    GetNamespaceConfig(namespace: string, key: string, defaultVal?: string): string

    vtoken: string
    rand_answer: boolean
    auto: boolean
    video_mute: boolean
    answer_ignore: boolean
    video_cdn: string
    video_multiple: number
    interval: number
    topic_interval: number
    super_mode: boolean
}

// 缓存默认值
let configDefaultValue: Map<string, any> = new Map<string, any>();
configDefaultValue.set("vtoken", "");
for (let key in SystemConfig.config) {
    for (let i = 0; i < SystemConfig.config[key].items.length; i++) {
        configDefaultValue.set(key + "_" + SystemConfig.config[key].items[i].key, SystemConfig.config[key].items[i].value);
    }
}

export class ChromeConfigItems implements ConfigItems {

    protected config: Config;
    protected Namespace: string = "";
    protected localCache: { [key: string]: any };

    constructor(config: Config) {
        this.config = config;
        let list: string[] = [];
        configDefaultValue.forEach((val, key) => {
            list.push(key);
        });
        this.config.Watch(list, (key, val) => {
            this.localCache[key] = val;
        });
        this.localCache = localStorage;
    }

    // 设置配置的命名空间,储存格式为 namepace_configkey
    public SetNamespace(namespace: string): void {
        this.Namespace = namespace + "_";
    }

    public ConfigList(): any {
        return this.config.ConfigList();
    }

    public SetNamespaceConfig(namespace: string, key: string, val: string): Promise<any> {
        return this.config.SetConfig(namespace + "_" + key, val);
    }

    public GetNamespaceConfig(namespace: string, key: string, defaultVal?: string): string {
        return this.config.GetConfig(namespace + "_" + key, defaultVal);
    }

    public GetConfig(key: string, defaultVal?: string): string {
        let val = this.config.GetConfig(this.Namespace + key);
        if (val == undefined) {
            return this.config.GetConfig(key, defaultVal);
        }
        return val || defaultVal;
    }

    public Watch(key: string | string[], callback: ConfigWatchCallback): void {
        this.config.Watch(key, callback);
    }

    public get super_mode() {
        return toBool(this.GetConfig("super_mode", "true"));
    }

    public get vtoken() {
        return this.GetConfig("vtoken", "");
    }

    public get rand_answer() {
        return toBool(this.GetConfig("rand_answer", "false"));
    }

    public get auto() {
        return toBool(this.GetConfig("auto", "true"));
    }

    public set auto(val: boolean) {
        this.SetConfig("auto", boolToString(val));
    }

    public get video_mute() {
        return toBool(this.GetConfig("video_mute", "true"));
    }

    public get answer_ignore() {
        return toBool(this.GetConfig("answer_ignore", "false"));
    }

    public get video_cdn() {
        let val = this.GetConfig("video_cdn");
        if (val == "默认") {
            return ""
        }
        return val;
    }

    public get video_multiple() {
        return parseFloat(this.GetConfig("video_multiple"));
    }

    public get interval() {
        let interval = parseFloat(this.GetConfig("interval", "0.1"));
        interval = interval * 100;
        return Math.floor(randNumber(interval - interval / 2, interval + interval / 2)) / 100;
    }

    public SetConfig(key: string, val: any): Promise<any> {
        return this.config.SetConfig(this.Namespace + key, val);
    }

    public get topic_interval() {
        return parseInt(this.GetConfig("topic_interval", "5"));
    }

    public set topic_interval(val: number) {
        this.SetConfig("topic_interval", val);
    }
}

export interface Config {
    GetConfig(key: string, defaultVal?: string): string

    SetConfig(key: string, val: string): Promise<any>

    ConfigList(): any

    Watch(key: Array<string> | string, callback: ConfigWatchCallback): void
}

export interface ConfigWatchCallback {
    (key: string, value: string): void
}

// 后台环境中使用
export function NewBackendConfig(): Promise<backendConfig> {
    return new Promise(async resolve => {
        let ret = new backendConfig();
        await ret.updateCache();
        resolve(ret);
    });
}

class configWatch {

    protected watchCallback: Map<string, Array<ConfigWatchCallback>>;

    constructor() {
        this.watchCallback = new Map<string, Array<ConfigWatchCallback>>();
    }

    public WatchEvent(key: string, val: string) {
        let list = this.watchCallback.get(key);
        if (list != undefined) {
            list.forEach((v) => {
                v(key, val)
            });
        }
        list = this.watchCallback.get("*");
        if (list != undefined) {
            list.forEach((v) => {
                v(key, val)
            });
        }
    }

    public Watch(key: Array<string> | string, callback: ConfigWatchCallback): void {
        if (typeof key == "string") {
            this.setWatchMap(key, callback);
            return;
        }
        key.forEach((val: string, index: number) => {
            this.setWatchMap(val, callback);
        });
    }

    protected setWatchMap(key: string, callback: ConfigWatchCallback) {
        let list = this.watchCallback.get(key);
        if (list == undefined) {
            list = new Array<ConfigWatchCallback>();
        }
        list.push(callback);
        this.watchCallback.set(key, list);
    }

}

class backendConfig implements Config {

    protected cache: { [key: string]: string };
    protected watch: configWatch;

    constructor() {
        this.watch = new configWatch();
        chrome.runtime.onMessage.addListener((request) => {
            if (request.type && request.type == "cxconfig") {
                this.cache[request.key] = request.value;
                this.watch.WatchEvent(request.key, request.value);
                this.updateConfigStorage();
            }
        });
    }

    // 更新配置转为json,存入
    protected updateConfigStorage() {
        let txt = JSON.stringify(this.cache);
        chrome.storage.sync.set({ "config_storage": txt });
    }

    // 更新缓存
    public updateCache(): Promise<any> {
        return new Promise(resolve => {
            chrome.storage.sync.get("config_storage", items => {
                if (items["config_storage"]) {
                    this.cache = JSON.parse(items["config_storage"]);
                } else {
                    this.cache = {};
                }
                configDefaultValue.forEach((val, key) => {
                    if (this.cache[key] === undefined) {
                        this.cache[key] = val;
                    }
                });
                this.updateConfigStorage();
                resolve(undefined);
            });
        });
    }

    public GetConfig(key: string, defaultVal?: string): string {
        if (this.cache == undefined) {
            Application.App.log.Fatal("缓存失败!!!");
            return "";
        }
        return this.cache[key] || defaultVal;
    }

    public Watch(key: Array<string> | string, callback: ConfigWatchCallback): void {
        return this.watch.Watch(key, callback);
    }

    public SetConfig(key: string, val: any): Promise<void> {
        return new Promise<any>(resolve => {
            let info: { [key: string]: number; } = {};
            info[key] = val;
            //通知前端和后端
            this.cache[key] = val;
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, { type: "cxconfig", key: key, value: val });
            });
            chrome.runtime.sendMessage({ type: "cxconfig", key: key, value: val });
            this.updateConfigStorage();
            resolve(undefined);
        });
    }

    public ConfigList(): any {
        return new Promise(async resolve => {
            if (this.cache) {
                return resolve(this.cache);
            }
            await this.updateCache();
            resolve(this.cache);
        });
    }
}

// 前端环境使用
export function NewFrontendGetConfig(): Config {
    return new frontendGetConfig();
}

class frontendGetConfig implements Config {

    protected cache: { [key: string]: string };
    protected watch: configWatch;

    constructor() {
        this.watch = new configWatch();
        this.cache = (<any>window).configData || localStorage;
        window.addEventListener('message', (event) => {
            if (event.data.type && event.data.type == "cxconfig") {
                Application.App.log.Info("配置更新:" + event.data.key + "=" + event.data.value);
                this.cache[event.data.key] = event.data.value;
                this.watch.WatchEvent(event.data.key, event.data.value);
            }
        });
    }

    public GetConfig(key: string, defaultVal?: string): string {
        if ((<any>window).GM_getValue) {
            return (<any>window).GM_getValue(key, defaultVal);
        }
        return this.cache[key] || defaultVal;
    }

    public Watch(key: Array<string> | string, callback: ConfigWatchCallback): void {
        return this.watch.Watch(key, callback);
    }

    public async SetConfig(key: string, val: string): Promise<any> {
        this.cache[key] = val;
        if ((<any>window).GM_setValue) {
            return (<any>window).GM_setValue(key, val);
        }
        return Application.App.Client.Send({
            type: "GM_setValue", details: { key: key, val: val },
        });
    }

    public ConfigList(): any {
        return this.cache;
    }
}
