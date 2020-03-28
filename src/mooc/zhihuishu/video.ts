import {Mooc} from "@App/mooc/factory";
import {Hook, Context} from "@App/internal/utils/hook";
import {Application} from "@App/internal/application";
import "../../views/common";
import {randNumber, post, substrex} from "@App/internal/utils/utils";

export class ZhsVideo implements Mooc {

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
        let ul = document.createElement("ul");
        tools.appendChild(ul);
        let li1 = document.createElement("li");
        ul.appendChild(li1);
        let boomBtn = document.createElement("a");
        boomBtn.href = "#";
        boomBtn.id = "zhs-video-boom";
        boomBtn.innerText = "秒过视频";
        boomBtn.onclick = () => {
            (<any>Application.GlobalContext).videoBoom(() => {

            });
        };
        li1.appendChild(boomBtn);
        document.querySelector(".videotop_box.fl").append(tools);
    }

    protected compile() {
        let interval = Application.App.config.interval;
        Application.App.log.Info(interval + "分钟后自动切换下一节");
        setTimeout(function () {
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

    protected start() {
        let hookPlayerStarter = new Hook("createPlayer", (<any>Application.GlobalContext).PlayerStarter);
        let self = this;
        hookPlayerStarter.Middleware(function (next: Context, ...args: any) {
            self.createToolsBar();
            Application.App.log.Info("视频开始加载");
            let hookPause = args[2].onPause;
            let hookReady = args[2].onReady;
            let video: HTMLVideoElement;
            args[2].onReady = function () {
                hookReady.apply(this);
                video = document.querySelector("#vjs_container_html5_api");
                video.muted = Application.App.config.video_mute;
                video.playbackRate = Application.App.config.video_multiple;

                Application.App.config.auto && video.play();
            }
            args[2].hookPause = function () {
                hookPause.apply(this);
                Application.App.config.auto && video.play();
            }
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