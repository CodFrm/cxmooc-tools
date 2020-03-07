import { Client, NewExtensionClientMessage, NewChromeClientMessage } from "./message";
import { randNumber } from "./utils";

export interface ConfigItems extends GetConfig {
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

    protected getConfig: GetConfig;
    constructor(getConfig: GetConfig) {
        this.getConfig = getConfig;
    }

    public GetConfig(key: string) {
        return this.getConfig.GetConfig(key);
    }
    public Watch(key: string | string[], callback: (key: string) => void): void {
        this.getConfig.Watch(key, callback);
    }

    public bool(val: any): boolean {
        if (typeof val == "boolean") {
            return val;
        }
        return val == "true";
    }

    public get super_mode() {
        return this.bool(this.getConfig.GetConfig("super_mode"));
    }

    public get vtoken() {
        return this.getConfig.GetConfig("vtoken");
    }

    public get rand_answer() {
        return this.bool(this.getConfig.GetConfig("rand_answer"));
    }

    public get auto() {
        return this.bool(this.getConfig.GetConfig("auto"));
    }

    public get video_mute() {
        return this.bool(this.getConfig.GetConfig("video_mute"));
    }

    public get answer_ignore() {
        return this.bool(this.getConfig.GetConfig("answer_ignore"));
    }

    public get video_cdn() {
        return this.getConfig.GetConfig("video_cdn");
    }

    public get video_multiple() {
        return this.getConfig.GetConfig("video_multiple");
    }

    public get interval() {
        let interval = (this.getConfig.GetConfig("interval") || 0.1) * 100;
        return Math.floor(randNumber(interval - interval / 2, interval + interval / 2)) / 100;
    }

}

export interface GetConfig {
    GetConfig(key: string): any
    Watch(key: Array<string> | string, callback: (key: string) => void): void
}

export interface SetConfig {
    SetConfig(key: string, val: any): void
}

// 后台环境中使用
export function NewBackendConfig(): backendConfig {
    return new backendConfig();
}

class backendConfig implements GetConfig, SetConfig {

    public GetConfig(key: string): Promise<any> {
        return new Promise<any>(resolve => (chrome.storage.sync.get(key, (value) => {
            if (value.hasOwnProperty(<string>key)) {
                resolve(<any>value[<string>key]);
            } else {
                resolve(undefined);
            }
        })));
    }

    public Watch(key: Array<string> | string, callback: (key: string) => void): void {
        throw new Error("Method not implemented.");
    }

    public SetConfig(key: string, val: any): Promise<void> {
        return new Promise<any>(resolve => {
            let info: { [key: string]: number; } = {};
            info[key] = val;
            chrome.storage.sync.set(info, () => {
                chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                    chrome.tabs.sendMessage(tabs[0].id, { type: "cxconfig", key: key, value: val });
                });
                resolve();
            });
        });
    }
}

// 前端环境使用
export function NewFrontendGetConfig(): GetConfig {
    return new frontendGetConfig();
}

class frontendGetConfig implements GetConfig {

    protected watchCallback: Map<string, Array<(key: string) => void>>

    constructor() {
        window.addEventListener('message', function (event) {
            if (event.data.type && event.data.type == "cxconfig") {
                localStorage[event.data.key] = event.data.value;
            }
        });
    }

    public GetConfig(key: string): any {
        return localStorage[key];
    }

    public Watch(key: Array<string> | string, callback: (key: string) => void): void {
        if (typeof key == "string") {
            this.setWatchMap(key, callback);
            return;
        }
        key.forEach((val: string, index: number) => {
            this.setWatchMap(val, callback);
        });
    }

    protected setWatchMap(key: string, callback: (key: string) => void) {
        //TODO: 监控配置项更新
    }
}

export class SystemConfig {
    public static version = 2.12;
    public static url = "https://cx.icodef.com/";
    public static configMap: any = {
        version: SystemConfig.version,
        url: SystemConfig.url,
    };

    public static GetConfig(key: string): Promise<any> {
        let ret = SystemConfig.configMap[key];
        if (ret == undefined) {
            return new backendConfig().GetConfig(key);
        }
        return ret;
    }

    public static SetConfig(key: string, val: any): void {
        SystemConfig.configMap[key] = val;
    }

    public static async SendConfig(client: Client, key: string): Promise<void> {
        client.Send({ val: await SystemConfig.GetConfig(key) })
    }

}

