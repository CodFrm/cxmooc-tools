import {NewBackendConfig, ChromeConfigItems, Config, NewFrontendGetConfig} from "../internal/utils/config";
import {Application, Backend, Launcher} from "../internal/application";
import {SystemConfig} from "../config";
import {boolToString, dealHotVersion, protocolPrompt, toBool} from "../internal/utils/utils";
import Vue from 'vue';

class popup implements Launcher {
    protected vm: Vue;

    constructor() {
    }

    public start() {
        this.vm = new Vue({
            el: "#platform-config",
            data: {
                selectKey: 'cx',
                configs: SystemConfig.config
            },
            async created() {
                for (let key in this.configs) {
                    for (let index in this.configs[key].items) {
                        let item = this.configs[key].items[index];
                        let val = Application.App.config.GetNamespaceConfig(key, item.key, undefined);
                        if (val == undefined) {
                            val = Application.App.config.GetConfig(item.key, item.value);
                        }
                        item.value = this.toVal(item.type, val);
                    }
                }
            },
            methods: {
                toVal(type: string, val: string): boolean | string {
                    switch (type) {
                        case "checkbox": {
                            return toBool(val);
                        }
                        default: {
                            return val;
                        }
                    }
                },
                changeTab(key: string) {
                    this.selectKey = key;
                },
                async change(namespace: string, key: string, type: string, val: string | boolean, index: number, prompt: string) {
                    if (prompt !== undefined) {
                        // 弹出信息框,还原值
                        if (!protocolPrompt(prompt, key)) {
                            let val = Application.App.config.GetNamespaceConfig(namespace, key, undefined);
                            if (val == undefined) {
                                val = Application.App.config.GetConfig(key, this.configs[namespace].items[index].value);
                            }
                            this.configs[namespace].items[index].value = this.toVal(type, val);
                            return false;
                        }
                    }
                    if (namespace == "common") {
                        namespace = "";
                    }
                    switch (type) {
                        case "checkbox": {
                            await Application.App.config.SetNamespaceConfig(namespace, key, boolToString(<boolean>val));
                            break;
                        }
                        default: {
                            await Application.App.config.SetNamespaceConfig(namespace, key, <string>val);
                        }
                    }
                }
            }
        });

        let vtoken = <HTMLInputElement>document.querySelector("#vtoken");
        vtoken.onchange = function () {
            Application.App.config.SetConfig("vtoken", vtoken.value || "");
        }
        vtoken.value = Application.App.config.GetConfig("vtoken");

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

}

window.onload = async () => {
    let config = new ChromeConfigItems(await NewBackendConfig());
    let component = new Map<string, any>().set("config", config);
    let app = new Application(Backend, new popup(), component);
    app.run();
}