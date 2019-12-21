import {Client, NewChromeClientMessage, NewExtensionClientMessage} from "./utils/message";
import {HttpUtils} from "./utils/utils";
import {Config} from "./utils/config";

export const IsFrontend = (chrome.storage !== undefined);
export const IsBackground = (chrome.browserAction !== undefined);
export const IsContent = IsFrontend && !IsBackground;

export const AppName = "cxmooc-tools";

let defaultClient: (tag: string) => Client = undefined;
if (IsFrontend) {
    defaultClient = NewExtensionClientMessage;
} else {
    defaultClient = NewChromeClientMessage;
}

export const DefaultClient = defaultClient;

export interface UpdateData {
    version: number
    url: string
    enforce: string
    hotversion: number
    injection: string
}

export function CheckUpdate(callback: (isnew: boolean, data: UpdateData) => void) {
    if (IsContent) {
        chrome.storage.local.get(["version", "enforce", "hotversion", "url"], function (item) {
            callback((Config.version < item.version), item as UpdateData);
        });
        return;
    }
    HttpUtils.HttpGet(Config.url + "update?ver=" + Config.version, {
        json: true,
        success: function (json) {
            let data: UpdateData = {
                version: json.version,
                url: json.url,
                enforce: json.enforce,
                hotversion: json.hotversion,
                injection: json.injection,
            };
            chrome.storage.local.set(data);
            callback((Config.version < data.version), data);
        }, error: function () {
            callback(false, undefined);
        }
    });
}