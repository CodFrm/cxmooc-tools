import {HttpUtils} from "./internal/utils/utils";
import {GetConfig, NewBackendConfig, SetConfig, SystemConfig} from "./internal/utils/config";
import {CheckUpdate} from "./internal/application";

class popup {

    private getConfig: GetConfig;

    private setConfig: SetConfig;

    constructor(getconf: GetConfig, setconf: SetConfig) {
        this.getConfig = getconf;
        this.setConfig = setconf;
    }

    public async main() {
        let cfg = document.getElementsByTagName("input");
        for (let i = 0; i < cfg.length; i++) {
            let el = cfg.item(i);
            let key = el.getAttribute("config-key");
            if (key != "") {
                let pop = this;
                el.onchange = async function (ev) {
                    let promptMsg = (<HTMLElement>this).getAttribute("prompt");
                    if (promptMsg !== null && await pop.getConfig.GetConfig(key + "_prompt") == false) {
                        let msg = prompt(promptMsg);
                        if (msg !== "yes") {
                            (<HTMLInputElement>this).value = await pop.getConfig.GetConfig(key) || 1;
                            return;
                        }
                        pop.setConfig.SetConfig(key + "_prompt", true);
                    }
                    switch ((<HTMLInputElement>this).type) {
                        case"checkbox": {
                            pop.setConfig.SetConfig(key, (<HTMLInputElement>this).checked);
                            break;
                        }
                        default: {
                            pop.setConfig.SetConfig(key, (<HTMLInputElement>this).value);
                        }
                    }
                };
                this.defaultVal(el, key);
            }
        }
        CheckUpdate(function (isnew, data) {
            let v: number;
            if (data === undefined) {
                (<HTMLImageElement>document.getElementById("tiku")).src = "https://img.shields.io/badge/%E9%A2%98%E5%BA%93-error-red.svg";
                v = SystemConfig.version;
            } else {
                if (isnew) {
                    var p = document.createElement('p');
                    p.style.color = "#ff0000";
                    p.innerHTML = '有新的版本更新:<a href="' + data.url + '" style="float:right;" target="_blank">点我去下载</a>  最新版本:v' + data.version;
                    document.getElementsByTagName('body')[0].appendChild(p);
                }
                document.getElementById("injection").innerHTML = data.injection;
                v = (SystemConfig.version > data.hotversion ? SystemConfig.version : data.hotversion);
            }
            document.getElementById('version').innerHTML = 'v' + v;
        });
    }

    private async defaultVal(el: HTMLInputElement, key: string) {
        let def = el.getAttribute("default-val");
        switch (el.type) {
            case"checkbox": {
                if (def === "true") {
                    el.checked = await this.getConfig.GetConfig(key) || true;
                    return;
                }
                el.checked = await this.getConfig.GetConfig(key) || false;
                return;
            }
            default: {
                el.value = await this.getConfig.GetConfig(key) || def || "";
                return;
            }
        }
    }
}

window.onload = function () {
    let config = NewBackendConfig();
    new popup(config, config).main();
};
