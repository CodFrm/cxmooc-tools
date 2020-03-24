import { Client, NewChromeClientMessage, NewExtensionClientMessage } from "./utils/message";
import { HttpUtils } from "./utils/utils";
import { ConfigItems } from "./utils/config";
import { Logger } from "./utils/log";
import { SystemConfig } from "@App/config";
import { QuestionBank } from "./app/question";

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
    protected static runEnv: string;
    protected static IsFrontend: boolean;
    protected static IsBackend: boolean;
    protected static IsContent: boolean;

    protected launcher: Launcher;
    protected component: Map<string, any>
    constructor(runEnv: string, launcher: Launcher, component?: Map<string, any>) {
        Application.app = this;
        Application.runEnv = runEnv;
        this.runEnvSwitch(runEnv);
        this.launcher = launcher;
        this.component = component;

        if (Application.App.debug) {
            SystemConfig.url = "http://localhost:8080/";
        }
    }

    public get debug(): boolean {
        return process.env.NODE_ENV == "development";
    }

    public get prod(): boolean {
        return process.env.NODE_ENV == "production";
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

    private runEnvSwitch(env: string): void {
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
            chrome.storage.local.get(["version", "enforce", "hotversion", "url"], async function (item) {
                await callback((SystemConfig.version < item.version), item as UpdateData);
            });
            return;
        }
        HttpUtils.HttpGet(SystemConfig.url + "update?ver=" + SystemConfig.version, {
            json: true,
            success: async function (json) {
                let data: UpdateData = {
                    version: json.version,
                    url: json.url,
                    enforce: json.enforce,
                    hotversion: json.hotversion,
                    injection: json.injection,
                };
                chrome.storage.local.set(data);
                await callback((SystemConfig.version < data.version), data);
            }, error: async function () {
                await callback(false, undefined);
            }
        });
    }
}

export interface UpdateData {
    version: number
    url: string
    enforce: string
    hotversion: string
    injection: string
}
