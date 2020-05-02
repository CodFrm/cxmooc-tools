import {NewBackendConfig, ChromeConfigItems, Config} from "./internal/utils/config";
import {Application, Backend, Launcher} from "./internal/application";
import {SystemConfig} from "./config";
import {boolToString, dealHotVersion, toBool} from "./internal/utils/utils";

class popup implements Launcher {

    constructor() {
    }

    public async start() {
        let self = this;
        let cfg = document.getElementsByTagName("input");
        for (let i = 0; i < cfg.length; i++) {
            let el = cfg.item(i);
            let key = el.getAttribute("config-key");
            if (key != "") {
                el.onchange = async function () {
                    let promptMsg = (<HTMLElement>this).getAttribute("prompt");
                    if (promptMsg !== null && !localStorage[key + "_prompt"]) {
                        let msg = prompt(promptMsg);
                        if (msg !== "yes") {
                            (<HTMLInputElement>this).value = String(parseFloat(await Application.App.config.GetConfig(key)) || 1);
                            return;
                        }
                        localStorage[key + "_prompt"] = true;
                    }
                    switch ((<HTMLInputElement>this).type) {
                        case "checkbox": {
                            Application.App.config.SetConfig(key, boolToString((<HTMLInputElement>this).checked));
                            break;
                        }
                        default: {
                            Application.App.config.SetConfig(key, (<HTMLInputElement>this).value);
                        }
                    }
                };
                this.getVal(el, key);
            }
        }
        Application.CheckUpdate(function (isnew, data) {
            let v: any;
            if (data === undefined) {
                (<HTMLImageElement>document.getElementById("tiku")).src = "./../img/error.svg";
                v = SystemConfig.version + ".0";
            } else {
                if (isnew) {
                    var p = document.createElement('p');
                    p.style.color = "#ff0000";
                    p.innerHTML = '有新的版本更新:<a href="' + data.url + '" style="float:right;" target="_blank">点我去下载</a>  最新版本:v' + data.version;
                    document.getElementsByTagName('body')[0].appendChild(p);
                }
                document.getElementById("injection").innerHTML = data.injection;
                v = (SystemConfig.version >= dealHotVersion(data.hotversion) ? SystemConfig.version + ".0" : data.hotversion);
            }
            document.getElementById('version').innerHTML = 'v' + v + (Application.App.debug ? " debug" : "");
        });
    }

    private async getVal(el: HTMLInputElement, key: string) {
        let val = await Application.App.config.GetConfig(key, "");
        switch (el.type) {
            case "checkbox": {
                el.checked = toBool(val);
                return;
            }
            default: {
                el.value = val;
                return;
            }
        }
    }
}

window.onload = function () {
    let config = NewBackendConfig(true);
    let component = new Map<string, any>().set("config", config);
    let app = new Application(Backend, new popup(), component);
    app.run();
};
