import { Client } from "./message";
import { AppName, Application } from "../application";
import { randNumber } from "./utils";

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
        let client = Application.App().Client;
        let p = new Promise<any>(resolve => ((<Client>client).Recv((data) => {
            if (key == "interval") {
                let interval = (data.val || 0.1) * 60000;
                resolve(randNumber(interval - (interval / 2), interval + (interval / 2)));
            } else {
                resolve(data.val);
            }
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

