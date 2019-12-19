import {Client, NewChromeClientMessage, NewExtensionClientMessage} from "./utils/message";

export const IsExtension = (chrome.storage !== undefined);
export const IsBackground = (chrome.browserAction !== undefined);

export const AppName = "cxmooc-tools";

let defaultClient: (tag: string) => Client = undefined;
if (IsExtension) {
    defaultClient = NewExtensionClientMessage;
} else {
    defaultClient = NewChromeClientMessage;
}

export const DefaultClient = defaultClient;
