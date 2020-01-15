import {Client} from "./message";
import {AppName, DefaultClient, IsFrontend} from "../application";

export interface GetConfig {
    GetConfig(key: string): any
}

export interface SetConfig {
    SetConfig(key: string, val: any): void
}

export function NewBackendConfig(): backendConfig {
    return new backendConfig();
}

class backendConfig implements GetConfig, SetConfig {
    public GetConfig(key: string): Promise<any> {
        return new Promise<any>(resolve => (chrome.storage.sync.get(key, (value) => {
            if (value.hasOwnProperty(<string>key)) {
                resolve(<any>value[<string>key])
            } else {
                resolve(undefined)
            }
        })));
    }

    public SetConfig(key: string, val: any): void {
        let info: { [key: string]: number; } = {};
        info[key] = val;
        chrome.storage.sync.set(info);
    }
}

export function NewFrontendGetConfig(): GetConfig {
    return new frontendGetConfig();
}

class frontendGetConfig implements GetConfig {
    public async GetConfig(key: string): Promise<any> {
        let client = DefaultClient(AppName);
        let p = new Promise<any>(resolve => ((<Client>client).Recv((data) => {
            resolve(data.val);
        })));
        (<Client>client).Send({type: "config", key: key});
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
        return SystemConfig.configMap[key];
    }

    public static SetConfig(key: string, val: any): void {
        SystemConfig.configMap[key] = val;
    }

    public static SendConfig(client: Client, key: string): void {
        client.Send({val: SystemConfig.GetConfig(key)})
    }

}

