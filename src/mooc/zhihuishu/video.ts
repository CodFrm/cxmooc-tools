import { Mooc } from "@App/internal/app/mooc";
import { Hook, Context } from "@App/internal/utils/hook";
import { Application } from "@App/internal/application";
import "../../views/common";
import { randNumber, post, substrex, protocolPrompt, createBtn } from "@App/internal/utils/utils";
import { CssBtn } from "./utils/css-tool";
import * as queryString from "querystring";


export class ZhsVideo implements Mooc {

    protected lastTimer: NodeJS.Timer;
    protected video: HTMLVideoElement;
    protected nowVideoId: number;
    protected videoList: any;
    protected studiedLessonDtoId: number;
    protected studyTotalTime: number;
    protected watchPointPost: string;

    public Init() {
        this.hookAjax();
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
        let boomBtn = CssBtn(createBtn("秒过视频", "", "zhs-tools-btn"));
        boomBtn.onclick = () => {
            if (!protocolPrompt("秒过视频会产生不良记录,是否继续?", "boom_no_prompt")) {
                return;
            }
            let timeStr = (<HTMLSpanElement>document.querySelector(".nPlayTime .duration")).innerText;
            let time = 0;
            let temp = timeStr.match(/[\d]+/gi);
            for (let i = 0; i < 3; i++) {
                time += parseInt(temp[i]) * Math.pow(60, 2 - i);
            }
            time += randNumber(20, 200);
            let tn = time;
            //通过id搜索视频信息
            let lessonId = 0, smallLessonId = 0, chapterId = 0;
            let subTit = (<HTMLSpanElement>document.querySelector(".current_play .hour")).innerText;
            //获取x.x.x DOM
            let videoTag = subTit.split('.');
            if (videoTag.length >= 2) {
                lessonId = this.videoList.videoChapterDtos[Number.parseInt(videoTag[0]) - 1].videoLessons[Number.parseInt(videoTag[1]) - 1].id;
                chapterId = this.videoList.videoChapterDtos[Number.parseInt(videoTag[0]) - 1].videoLessons[Number.parseInt(videoTag[1]) - 1].chapterId;
                switch (videoTag.length) {
                    case 3:
                        smallLessonId = this.videoList.videoChapterDtos[Number.parseInt(videoTag[0]) - 1]
                            .videoLessons[Number.parseInt(videoTag[1]) - 1]
                            .videoSmallLessons[Number.parseInt(videoTag[2]) - 1].id;
                    default:
                        break;
                }
            }
            const tims = parseInt((time / 1.999).toString());
            for (let index = 0; index < tims; index++) {
                this.learningTimeRecord();
            }

            let s = [this.videoList.recruitId, lessonId, smallLessonId, this.nowVideoId, chapterId, "0", tn, this.studyTotalTime, timeStr]
                , l = {
                    watchPoint: this.watchPointPost,
                    ev: n.Z(s),
                    courseId: this.videoList.courseId,
                    learningTokenId: Base64.encode(this.studiedLessonDtoId.toString()),
                    uuid: substrex(document.cookie, "uuid%22%3A%22", "%22"),
                    dateFormate: Date.parse(<any>new Date()),
                };
            let postData = queryString.stringify(l);
            post("https://studyservice.zhihuishu.com/learning/saveDatabaseIntervalTime", postData, false, function (data: any) {
                let json = JSON.parse(data);
                try {
                    if (json.data.submitSuccess == true) {
                        alert("秒过成功,刷新后查看效果");
                    } else {
                        alert("秒过失败");
                    }
                } catch (e) {
                    alert("秒过失败");
                }
            });
        };
        const startBtnText = Application.App.config.auto ? "暂停挂机" : "开始挂机";
        let startBtn = CssBtn(createBtn(startBtnText, "", "zhs-tools-btn zhs-start-btn"));
        startBtn.addEventListener('click', () => {
            if (startBtn.innerText == "暂停挂机") {
                startBtn.innerText = "开始挂机";
                Application.App.config.auto = false;
                localStorage["auto"] = false;
            } else {
                startBtn.innerText = "暂停挂机";
                localStorage["auto"] = true;
                Application.App.config.auto = true;
                this.play();
            }
        })
        tools.appendChild(startBtn);
        tools.appendChild(boomBtn);
        document.querySelector(".videotop_box.fl").append(tools);
    }

    learningTimeRecord() {
        var t = parseInt(((this.studyTotalTime / 5) + 2).toString())
            , e = null == this.watchPointPost || "" == this.watchPointPost ? "0,1," : this.watchPointPost + ",";
        this.watchPointPost = e + t;
        this.studyTotalTime += 2;
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
            self.nowVideoId = args[1].id;
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
        let self = this;
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
            } else if (args[1].indexOf("learning/videolist") >= 0) {
                Object.defineProperty(this, "responseText", {
                    get: function () {
                        let json = JSON.parse(this.response);
                        self.videoList = json.data;
                        return this.response;
                    }
                });
            } else if (args[1].indexOf("learning/prelearningNote") >= 0) {
                Object.defineProperty(this, "responseText", {
                    get: function () {
                        let json = JSON.parse(this.response);
                        self.studiedLessonDtoId = json.data.studiedLessonDto.id;
                        self.studyTotalTime = json.data.studiedLessonDto.studyTotalTime;
                        return this.response;
                    }
                });
            }
            let ret = next.apply(this, args);
            return ret;
        });
    }
}

var n = {
    _a: "AgrcepndtslzyohCia0uS@",
    _b: "A0ilndhga@usreztoSCpyc",
    _c: "d0@yorAtlhzSCeunpcagis",
    _d: "zzpttjd",
    X: function (t: any) {
        for (var e = "", i = 0; i < t[this._c[8] + this._a[4] + this._c[15] + this._a[1] + this._a[8] + this._b[6]]; i++) {
            var n = t[this._a[3] + this._a[14] + this._c[18] + this._a[2] + this._b[18] + this._b[16] + this._c[0] + this._a[4] + this._b[0] + this._b[15]](i) ^ this._d[this._b[21] + this._b[6] + this._a[17] + this._c[5] + this._b[18] + this._c[4] + this._a[7] + this._a[4] + this._a[0] + this._c[7]](i % this._d[this._a[10] + this._b[13] + this._b[4] + this._a[1] + this._c[7] + this._a[14]]);
            e += this.Y(n)
        }
        return e
    },
    Y: function (t: any) {
        var e = t[this._c[7] + this._a[13] + this._a[20] + this._b[15] + this._a[2] + this._b[2] + this._c[15] + this._c[19]](16);
        return e = e[this._b[3] + this._a[4] + this._b[4] + this._a[1] + this._c[7] + this._c[9]] < 2 ? this._b[1] + e : e,
            e[this._a[9] + this._b[3] + this._c[20] + this._c[17] + this._c[13]](-4)
    },
    Z: function (t: any) {
        for (var e = "", i = 0; i < t.length; i++)
            e += t[i] + ";";
        return e = e.substring(0, e.length - 1),
            this.X(e)
    }
};