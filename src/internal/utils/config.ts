import {Client} from "./message";
import {AppName, DefaultClient, IsExtension} from "../application";

export class Config {
    public static version: number = 2.12;
    public static url: string = "https://cx.icodef.com/";

    public static async GetConfig(client: Client | string, key?: string): Promise<any> {
        if (!IsExtension) {
            // 接收
            let inclient = client;
            let k = key;
            if (typeof client === "string") {
                inclient = DefaultClient(AppName);
                k = client;
            }
            let p = new Promise<any>(resolve => ((<Client>inclient).Recv((data) => {
                resolve(data.val);
            })));
            (<Client>inclient).Send({type: "config", key: k});
            return p;
        }
        return new Promise<any>(resolve => (chrome.storage.sync.get(client, (value) => {
            if (value.hasOwnProperty(<string>client)) {
                resolve(value)
            } else {
                resolve(undefined)
            }
        })));
    }

    public static SetConfig(key: string, val: any): void {
        let info = new Map();
        info.set(key, val);
        chrome.storage.sync.set(info);
    }

    public static async SendConfig(client: Client, key: string): Promise<void> {
        client.Send({val: await this.GetConfig(key)})
    }

}
