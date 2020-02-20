import { Client } from "./message";
import { Application } from "../application";
import { randNumber } from "./utils";

export interface ConfigItems {
    vtoken: string
    rand_answer: boolean
    auto: boolean
    video_mute: boolean
    answer_ignore: boolean
    video_cdn: string
    video_multiple: number
    interval: number
    get(key: string): any
    set(key: string, val: any): void
}

export class ChromeConfigItems implements ConfigItems {
    protected setConfig: SetConfig;
    protected getConfig: GetConfig;
    constructor(getConfig: GetConfig, setConfig?: SetConfig) {
        this.setConfig = setConfig;
        this.getConfig = getConfig;
    }

    public get(key: string): any {
        return this.getConfig.GetConfig(key);
    }

    public set(key: string, val: any): any {
        return this.setConfig.SetConfig(key, val);
    }

    public get vtoken() {
        return this.getConfig.GetConfig("vtoken");
    }
    public set vtoken(val) {
        this.setConfig.SetConfig("vtoken", val);
    }

    public get rand_answer() {
        return this.getConfig.GetConfig("rand_answer");
    }
    public set rand_answer(val) {
        this.setConfig.SetConfig("rand_answer", val);
    }

    public get auto() {
        return this.getConfig.GetConfig("auto");
    }
    public set auto(val) {
        this.setConfig.SetConfig("auto", val);
    }

    public get video_mute() {
        return this.getConfig.GetConfig("video_mute");
    }
    public set video_mute(val) {
        this.setConfig.SetConfig("video_mute", val);
    }

    public get answer_ignore() {
        return this.getConfig.GetConfig("answer_ignore");
    }
    public set answer_ignore(val) {
        this.setConfig.SetConfig("answer_ignore", val);
    }

    public get video_cdn() {
        return this.getConfig.GetConfig("video_cdn");
    }
    public set video_cdn(val) {
        this.setConfig.SetConfig("video_cdn", val);
    }

    public get video_multiple() {
        return this.getConfig.GetConfig("video_multiple");
    }
    public set video_multiple(val) {
        this.setConfig.SetConfig("video_multiple", val);
    }

    public get interval() {
        return this.getConfig.GetConfig("interval");
    }
    public set interval(val) {
        this.setConfig.SetConfig("interval", val);
    }

}

export interface GetConfig {
    GetConfig(key: string): any
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

    public SetConfig(key: string, val: any): void {
        let info: { [key: string]: number; } = {};
        info[key] = val;
        chrome.storage.sync.set(info);
    }
}

// 前端环境使用
export function NewFrontendGetConfig(): GetConfig {
    return new frontendGetConfig();
}

class frontendGetConfig implements GetConfig {
    public async GetConfig(key: string): Promise<any> {
        let client = Application.App.Client;
        let p = new Promise<any>(resolve => ((<Client>client).Recv((data) => {
            resolve(data.val);
        })));
        (<Client>client).Send({ type: "config", key: key });
        return p;
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

