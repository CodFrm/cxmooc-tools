import {randNumber, toBool, boolToString} from "./utils";
import {Application} from "../application";

export interface ConfigItems extends Config {
    SetNamespace(namespace: string): void

    vtoken: string
    rand_answer: boolean
    auto: boolean
    video_mute: boolean
    answer_ignore: boolean
    video_cdn: string
    video_multiple: number
    interval: number
    super_mode: boolean
}

export class ChromeConfigItems implements ConfigItems {

    protected config: Config;
    public Namespace: string = "";
    protected localCache: { [key: string]: any };

    constructor(config: Config) {
        this.config = config;
        let list = ["vtoken", "rand_answer", "auto", "video_mute", "answer_ignore",
            "video_cdn", "video_multiple", "interval", "super_mode"];
        this.config.Watch(list, (key, val) => {
            this.localCache[key] = val;
        });
        this.localCache = localStorage;
    }

    public SetNamespace(namespace: string): void {
        this.Namespace = namespace;
    }

    public async GetConfig(key: string): Promise<any> {
        let val = await this.getCacheConfig(this.Namespace + key);
        return new Promise<any>(async resolve => {
            if (val == undefined && this.Namespace != "") {
                return resolve(await this.getCacheConfig(key));
            }
            return resolve(val);
        });
    }

    public Watch(key: string | string[], callback: ConfigWatchCallback): void {
        this.config.Watch(key, callback);
    }

    public get super_mode() {
        return toBool(this.getCacheConfig("super_mode", "true"));
    }

    public get vtoken() {
        return this.getCacheConfig("vtoken", "");
    }

    public get rand_answer() {
        return toBool(this.getCacheConfig("rand_answer", "false"));
    }

    public get auto() {
        return toBool(this.getCacheConfig("auto", "true"));
    }

    public set auto(val: boolean) {
        this.config.SetConfig("auto", boolToString(val));
    }

    public get video_mute() {
        return toBool(this.getCacheConfig("video_mute", "true"));
    }

    public get answer_ignore() {
        return toBool(this.getCacheConfig("answer_ignore", "false"));
    }

    public get video_cdn() {
        return this.getCacheConfig("video_cdn");
    }

    public get video_multiple() {
        return parseFloat(this.getCacheConfig("video_multiple"));
    }

    protected getCacheConfig(key: string, defaultVal?: string): string {
        let ret = this.localCache[key];
        if (ret === undefined) {
            return defaultVal;
        }
        return ret;
    }

    public get interval() {
        let interval = parseFloat(this.getCacheConfig("interval", "0.1"));
        interval = interval * 100;
        return Math.floor(randNumber(interval - interval / 2, interval + interval / 2)) / 100;
    }

    public SetConfig(key: string, val: any): Promise<any> {
        return this.config.SetConfig(key, val);
    }

}

export interface Config {
    GetConfig(key: string, defaultVal?: string): Promise<string>

    SetConfig(key: string, val: string): Promise<any>

    Watch(key: Array<string> | string, callback: ConfigWatchCallback): void
}

export interface ConfigWatchCallback {
    (key: string, value: string): void
}

// 后台环境中使用
export function NewBackendConfig(): backendConfig {
    return new backendConfig();
}

class backendConfig implements Config {

    public GetConfig(key: string, defaultVal?: string): Promise<any> {
        return new Promise<any>(resolve => (chrome.storage.sync.get(key, (value) => {
            if (value.hasOwnProperty(<string>key)) {
                resolve(<any>value[<string>key] || defaultVal);
            } else {
                resolve(undefined);
            }
        })));
    }

    public Watch(key: Array<string> | string, callback: ConfigWatchCallback): void {
        return
    }

    public SetConfig(key: string, val: any): Promise<void> {
        return new Promise<any>(resolve => {
            let info: { [key: string]: number; } = {};
            info[key] = val;
            chrome.storage.sync.set(info, () => {
                chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
                    chrome.tabs.sendMessage(tabs[0].id, {type: "cxconfig", key: key, value: val});
                });
                resolve();
            });
        });
    }
}

// 前端环境使用
export function NewFrontendGetConfig(): Config {
    return new frontendGetConfig();
}

class frontendGetConfig implements Config {

    protected watchCallback: Map<string, Array<ConfigWatchCallback>>;

    constructor() {
        window.addEventListener('message', function (event) {
            if (event.data.type && event.data.type == "cxconfig") {
                Application.App.log.Info("配置更新:" + event.data.key + "=" + event.data.value);
                localStorage[event.data.key] = event.data.value;
            }
        });
    }

    public GetConfig(key: string, defaultVal?: string): any {
        return localStorage[key] || defaultVal;
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
        //TODO: 监控配置项更新
    }

    public SetConfig(key: string, val: string): any {
        localStorage[key] = val;
    }
}
