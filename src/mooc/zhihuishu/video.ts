import {Mooc} from "@App/mooc/factory";
import {Hook, Context} from "@App/internal/utils/hook";
import {Application} from "@App/internal/application";
import "../../views/common";
import {randNumber, post, substrex} from "@App/internal/utils/utils";

export class ZhsVideo implements Mooc {

    protected lastTimer: NodeJS.Timer;
    protected video: HTMLVideoElement;

    public Start(): void {
        this.hookAjax();
        this.hook();
        document.addEventListener("readystatechange", () => {
            this.hook();
        });
        let timer = setInterval(() => {
            try {
                this.start();
                clearInterval(timer);
            } catch (e) {
            }
        }, 500);
    }

    protected createToolsBar() {
        let tools = document.createElement('div');
        tools.className = "entrance_div";
        tools.id = "cxtools";
        let boomBtn = document.createElement("a");
        boomBtn.href = "#";
        boomBtn.className = "zhs-tools-btn";
        boomBtn.innerText = "秒过视频";
        boomBtn.onclick = () => {
            (<any>Application.GlobalContext).videoBoom(() => {

            });
        };
        //TODO:优化,先这样把按钮弄出来
        let li2 = document.createElement("li");
        let startBtn = document.createElement("a");
        startBtn.href = "#";
        startBtn.className = "zhs-tools-btn zhs-start-btn";
        startBtn.innerText = Application.App.config.auto ? "暂停挂机" : "开始挂机";
        startBtn.onclick = () => {
            if (startBtn.innerText == "暂停挂机") {
                startBtn.innerText = "开始挂机";
                localStorage["auto"] = false;
            } else {
                startBtn.innerText = "暂停挂机";
                localStorage["auto"] = true;
                this.play();
            }
        };
        tools.appendChild(startBtn);
        tools.appendChild(boomBtn);

        console.log(document.querySelector(".videotop_box.fl").append(tools));
    }

    protected compile() {
        let interval = Application.App.config.interval;
        Application.App.log.Info(interval + "分钟后自动切换下一节");
        clearTimeout(this.lastTimer);
        this.lastTimer = setTimeout(function () {
            let $ = (<any>Application.GlobalContext).$;
            let next = $(".clearfix.video.current_play").next();
            if (next.length == 0) {
                next = $(".clearfix.video.current_play")
                    .parents("ul.list,div")
                    .next("div,ul.list")
                    .find("li.video");
            }
            if (next.length == 0) {
                alert("刷课完成");
                return;
            }
            Application.App.config.auto && $(next[0]).click();
        }, interval * 60000);
    }

    protected play() {
        if (this.video) {
            this.video.muted = Application.App.config.video_mute;
            this.video.playbackRate = Application.App.config.video_multiple;

            Application.App.config.auto && this.video.play();
        }
    }

    protected start() {
        let hookPlayerStarter = new Hook("createPlayer", (<any>Application.GlobalContext).PlayerStarter);
        let self = this;
        hookPlayerStarter.Middleware(function (next: Context, ...args: any) {
            self.createToolsBar();
            Application.App.log.Info("视频开始加载");
            let hookPause = args[2].onPause;
            let hookReady = args[2].onReady;
            args[2].onReady = function () {
                hookReady.apply(this);
                self.video = document.querySelector("#vjs_container_html5_api");
                Application.App.config.auto && self.play();
            };
            args[2].hookPause = function () {
                hookPause.apply(this);
                Application.App.config.auto && self.video.play();
            };
            let innerTimer = setInterval(function () {
                if (document.querySelectorAll(".current_play .time_icofinish").length > 0) {
                    clearInterval(innerTimer);
                    self.compile();
                }
            }, 2000);
            return next.apply(this, args);
        });
        let timeSetInterval = new Hook("setInterval", Application.GlobalContext);
        timeSetInterval.Middleware(function (next: Context, ...args: any) {
            Application.App.log.Debug("加速器启动");
            if (Application.App.config.super_mode) {
                args[1] = args[1] / Application.App.config.video_multiple;
            }
            return next.apply(this, args);
        });
    }

    protected hookAjax(): void {
        let hookXMLHttpRequest = new Hook("open", Application.GlobalContext.XMLHttpRequest.prototype);
        hookXMLHttpRequest.Middleware(function (next: Context, ...args: any) {
            if (args[1].indexOf("popupAnswer/loadVideoPointerInfo") >= 0) {
                Object.defineProperty(this, "responseText", {
                    get: function () {
                        let retText = this.response.replace(
                            /"questionPoint":\[.*?\],"knowledgeCardDtos"/gm,
                            '"questionPoint":[],"knowledgeCardDtos"'
                        );
                        return retText;
                    }
                });
            }
            let ret = next.apply(this, args);
            return ret;
        });
    }

    protected hook(): void {
        if (document.readyState != "interactive") {
            return;
        }
        let hookWebpack = new Hook("webpackJsonp", Application.GlobalContext);
        hookWebpack.Middleware(function (next: Context, ...args: any) {
            try {
                if (args[1][702]) {
                    Application.App.log.Debug("video hook ok", document.readyState);
                    let old = args[1][702];
                    args[1][702] = function () {
                        let ret = old.apply(this, arguments);
                        let hookInitVideo = new Hook("initVideo", arguments[1].default.methods);
                        hookInitVideo.Middleware(function (next: Context, ...args: any) {
                            Application.App.log.Debug("initVideo");
                            (<any>Application.GlobalContext).videoBoom = (callback: any) => {
                                let timeStr = (<HTMLSpanElement>document.querySelector(".nPlayTime .duration")).innerText;
                                let time = 0;
                                let temp = timeStr.match(/[\d]+/gi);
                                for (let i = 0; i < 3; i++) {
                                    time += parseInt(temp[i]) * Math.pow(60, 2 - i);
                                }
                                time += randNumber(20, 200);
                                let tn = time;
                                let a = this.lessonId
                                    , r = this.smallLessonId
                                    ,
                                    s = [this.recruitId, a, r, this.lastViewVideoId, 1, this.data.studyStatus, tn, time, timeStr]
                                    , l = {
                                        ev: this.D26666.Z(s),
                                        learningTokenId: Base64.encode(this.preVideoInfo.studiedLessonDto.id),
                                        uuid: substrex(document.cookie, "uuid%22%3A%22", "%22"),
                                        dateFormate: Date.parse(<any>new Date()),
                                    };
                                let postData = "ev=" + l.ev + "&learningTokenId=" + l.learningTokenId +
                                    "&uuid=" + l.uuid + "&dateFormate=" + l.dateFormate;

                                post("https://studyservice.zhihuishu.com/learning/saveDatabaseIntervalTime", postData, false, function (data: any) {
                                    let json = JSON.parse(data);
                                    try {
                                        if (json.data.submitSuccess == true) {
                                            alert("秒过成功,刷新后查看效果");
                                        } else {
                                            alert("秒过失败");
                                        }
                                        ;
                                    } catch (e) {
                                        alert("秒过失败");
                                    }
                                });
                            }
                            return next.apply(this, args);
                        });
                        return ret;
                    };
                }
            } catch (e) {
            }
            return next.apply(this, args);
        });
    }

}