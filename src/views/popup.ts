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
                configs: {
                    cx: {
                        name: "超星",
                        items: [{
                            title: "随机答案",
                            description: "如果题库没有正确的答案会随机选择",
                            type: "checkbox",
                            key: "rand_answer",
                            value: false,
                        }, {
                            title: "自动挂机",
                            description: "进入一个页面就会自动开始挂机,完成一个任务之后会自动进行下一个",
                            type: "checkbox",
                            key: "auto",
                            value: true,
                        }, {
                            title: "视频静音",
                            description: "播放视频时,自动开启静音",
                            type: "checkbox",
                            key: "video_mute",
                            value: true,
                        }, {
                            title: "忽略题目",
                            description: "自动挂机时,忽略掉题目不做,直接跳过",
                            type: "checkbox",
                            key: "answer_ignore",
                            value: false,
                        }, {
                            title: "超级模式",
                            description: "超星平台下,超级模式会自动将flash播放器换成h5播放器",
                            type: "checkbox",
                            key: "super_mode",
                            value: true,
                        }, {
                            title: "播放源",
                            description: "锁定视频播放源,为空为记录最后一次选中的源(公网1,公网2等)",
                            type: "text",
                            key: "video_cdn",
                            value: "默认"
                        }, {
                            title: "播放倍速",
                            description: "视频播放的倍数,1为正常速度(最高16倍,该功能有一定危险)",
                            type: "text",
                            key: "video_multiple",
                            prompt: "这是一个很危险的功能,建议不要进行调整,如果你想调整播放速度请在下方填写yes(智慧树平台播放速度和视频进度无关,最高只能1.5倍速)",
                            unit: "倍",
                            value: "1",
                        }, {
                            title: "跳转间隔",
                            description: "视频(题目,任务点)完成后n分钟再继续下一个任务,可以有小数点,例如:0.5=30秒",
                            type: "text",
                            key: "interval",
                            unit: "分",
                            value: "1",
                        }, {
                            title: "做题间隔",
                            description: "每一道题之间填写答案的时间间隔",
                            type: "text",
                            key: "topic_interval",
                            unit: "秒",
                            value: "5",
                        }],
                    }, zhs: {
                        name: "智慧树",
                        items: [{
                            title: "随机答案",
                            description: "如果题库没有正确的答案会随机选择",
                            type: "checkbox",
                            key: "rand_answer",
                            value: false,
                        }, {
                            title: "自动挂机",
                            description: "进入一个页面就会自动开始挂机,完成一个任务之后会自动进行下一个",
                            type: "checkbox",
                            key: "auto",
                            value: true,
                        }, {
                            title: "视频静音",
                            description: "播放视频时,自动开启静音",
                            type: "checkbox",
                            key: "video_mute",
                            value: true,
                        }, {
                            title: "超级模式",
                            description: "智慧树平台下,超级模式会让任务完成的倍速成真",
                            type: "checkbox",
                            key: "super_mode",
                            value: true,
                        }, {
                            title: "播放倍速",
                            description: "视频播放的倍数,1为正常速度(最高16倍,该功能有一定危险)",
                            type: "text",
                            key: "video_multiple",
                            prompt: "这是一个很危险的功能,建议不要进行调整,如果你想调整播放速度请在下方填写yes(智慧树平台播放速度和视频进度无关,最高只能1.5倍速)",
                            unit: "倍",
                            value: "1",
                        }, {
                            title: "跳转间隔",
                            description: "视频完成后n分钟再继续播放下一个,可以有小数点,例如:0.5=30秒",
                            type: "text",
                            key: "interval",
                            unit: "分",
                            value: "1",
                        }, {
                            title: "做题间隔",
                            description: "每一道题之间填写答案的时间间隔",
                            type: "text",
                            key: "topic_interval",
                            unit: "秒",
                            value: "5",
                        }],
                    }, mooc163: {
                        name: "中国大学MOOC",
                        items: [{
                            title: "随机答案",
                            description: "如果题库没有正确的答案会随机选择",
                            type: "checkbox",
                            key: "rand_answer",
                            value: false,
                        }, {
                            title: "自动挂机",
                            description: "进入一个页面就会自动开始挂机,完成一个任务之后会自动进行下一个",
                            type: "checkbox",
                            key: "auto",
                            value: true,
                        }, {
                            title: "视频静音",
                            description: "播放视频时,自动开启静音",
                            type: "checkbox",
                            key: "video_mute",
                            value: true,
                        }, {
                            title: "忽略题目",
                            description: "自动挂机时,忽略掉题目不做,直接跳过",
                            type: "checkbox",
                            key: "answer_ignore",
                            value: false,
                        }, {
                            title: "播放倍速",
                            description: "视频播放的倍数,1为正常速度(最高16倍,该功能有一定危险)",
                            type: "text",
                            key: "video_multiple",
                            prompt: "这是一个很危险的功能,建议不要进行调整,如果你想调整播放速度请在下方填写yes(智慧树平台播放速度和视频进度无关,最高只能1.5倍速)",
                            unit: "倍",
                            value: "1",
                        }, {
                            title: "跳转间隔",
                            description: "视频完成后n分钟再继续播放下一个,可以有小数点,例如:0.5=30秒",
                            type: "text",
                            key: "interval",
                            unit: "分",
                            value: "1",
                        }, {
                            title: "做题间隔",
                            description: "每一道题之间填写答案的时间间隔",
                            type: "text",
                            key: "topic_interval",
                            unit: "秒",
                            value: "5",
                        }],
                    },
                }
            },
            async created() {
                for (let key in this.configs) {
                    for (let index in this.configs[key].items) {
                        let item = this.configs[key].items[index];
                        let val = Application.App.config.GetNamespaceConfig(key, item.key, undefined);
                        if (val == undefined) {
                            val = Application.App.config.GetConfig(item.key, item.value);
                        }
                        switch (item.type) {
                            case "checkbox": {
                                item.value = toBool(val);
                                break;
                            }
                            default: {
                                item.value = val;
                            }
                        }
                    }
                }
            },
            methods: {
                changeTab(key: string) {
                    this.selectKey = key;
                },
                async change(namespace: string, key: string, type: string, val: string | boolean, prompt: string) {
                    if (prompt !== undefined) {
                        if (!protocolPrompt(prompt, key)) {
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