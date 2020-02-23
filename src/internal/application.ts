import { Client, NewChromeClientMessage, NewExtensionClientMessage } from "./utils/message";
import { HttpUtils } from "./utils/utils";
import { SystemConfig, ConfigItems } from "./utils/config";
import { Logger } from "./utils/log";

export const Backend = "backend";
export const Frontend = "frontend";
export const Content = "content";
export const AppName = "cxmooc-tools";

export interface Launcher {
    start(): void
}

export class Application {
    protected static app: Application;
    public static get App(): Application {
        return Application.app;
    }
    protected static env: string;
    protected static IsFrontend: boolean;
    protected static IsBackend: boolean;
    protected static IsContent: boolean;

    protected launcher: Launcher;
    protected component: Map<string, any>
    constructor(env: string, launcher: Launcher, component?: Map<string, any>) {
        Application.app = this;
        Application.env = env;
        this.EnvSwitch(env);
        this.launcher = launcher;
        this.component = component;
    }

    public get config(): ConfigItems {
        return this.component.get("config") as ConfigItems;
    }

    public get log(): Logger {
        return this.component.get("logger") as Logger;
    }

    public run(): void {
        this.launcher.start();
    }

    public get IsFrontend(): boolean {
        return Application.IsFrontend;
    }

    public get IsBackend(): boolean {
        return Application.IsBackend;
    }

    public get IsContent(): boolean {
        return Application.IsContent;
    }

    private EnvSwitch(env: string): void {
        switch (env) {
            case Frontend:
                Application.IsFrontend = true; break;
            case Backend:
                Application.IsBackend = true; break;
            case Content:
                Application.IsContent = true; break;
        };
    }

    public get Client(): Client {
        if (Application.IsFrontend) {
            return NewChromeClientMessage(AppName);
        }
        return NewExtensionClientMessage(AppName);
    }

    public static CheckUpdate(callback: (isnew: boolean, data: UpdateData) => void) {
        if (Application.IsContent) {
            chrome.storage.local.get(["version", "enforce", "hotversion", "url"], function (item) {
                callback((SystemConfig.version < item.version), item as UpdateData);
            });
            return;
        }
        HttpUtils.HttpGet(SystemConfig.url + "update?ver=" + SystemConfig.version, {
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
                callback((SystemConfig.version < data.version), data);
            }, error: function () {
                callback(false, undefined);
            }
        });
    }
}

export interface UpdateData {
    version: number
    url: string
    enforce: string
    hotversion: number
    injection: string
}
