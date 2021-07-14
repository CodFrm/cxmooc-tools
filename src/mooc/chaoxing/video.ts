import { Hook, Context } from "@App/internal/utils/hook";
import { Application } from "@App/internal/application";
import { randNumber, get, createBtn, protocolPrompt, isPhone } from "@App/internal/utils/utils";
import { CssBtn } from "./utils";
import { CxTaskControlBar, CxTask } from "@App/mooc/chaoxing/task";
import { Mooc } from "@App/internal/app/mooc";
import { TaskType } from "@App/internal/app/task";

// 优化播放器
export class CxVideoOptimization implements Mooc {

    protected param: any;

    public Init(): void {
        //对播放器进行优化
        window.addEventListener("load", () => {
            Application.App.config.super_mode && isPhone() && ((<any>Application.GlobalContext).Ext.isChaoxing = true);
        });
        this.hook();
        document.addEventListener("readystatechange", () => {
            this.hook();
        });
        this.Api();
    }

    protected hook() {
        if (document.readyState != "interactive") {
            return;
        }
        Application.App.log.Debug("hook cx video");
        let dataHook = new Hook("decode", (<any>Application.GlobalContext).Ext);
        let self = this;
        dataHook.Middleware(function (next: Context, ...args: any) {
            let ret = next.apply(this, args);
            if (Application.App.config.super_mode && ret.danmaku == 1) {
                ret.danmaku = 0;
            }
            return ret;
        });
        window.frameElement.setAttribute("fastforward", "");
        window.frameElement.setAttribute("switchwindow", "");

        let paramHook = new Hook("params2VideoOpt", (<any>Application.GlobalContext).ans.VideoJs.prototype);
        paramHook.Middleware(function (next: Context, ...args: any) {
            self.param = args[0];
            let ret = next.apply(this, args);
            ret.plugins.timelineObjects.url = self.param.rootPath + "/richvideo/initdatawithviewer";
            let cdn = Application.App.config.video_cdn || localStorage["cdn"] || "公网1";
            for (let i = 0; i < ret.playlines.length; i++) {
                if (ret.playlines[i].label == cdn) {
                    let copy = ret.playlines[i];
                    (<Array<any>>ret.playlines).splice(i, 1);
                    (<Array<any>>ret.playlines).splice(0, 0, copy);
                }
            }
            localStorage["cdn"] = ret.playlines[0].label;
            delete ret.plugins.studyControl;
            return ret;
        });
        (<any>Application.GlobalContext).Ext.isSogou = false;

        let errorHook = new Hook("afterRender", (<any>Application.GlobalContext).ans.videojs.ErrorDisplay.prototype);
        errorHook.Middleware(function (next: Context, ...args: any) {
            let ret = next.apply(this, args);
            setTimeout(() => {
                let nowCdn = this.renderData.selectedIndex;
                let playlines = this.renderData.playlines;
                let cdn = Application.App.config.video_cdn || localStorage["cdn"] || "公网1";
                for (let i = 0; i < playlines.length; i++) {
                    if (i != nowCdn) {
                        if (cdn == "") {
                            localStorage["cdn"] = playlines[i].label;
                            return this.onSelected(i);
                        } else if (cdn == playlines[i].label) {
                            localStorage["cdn"] = playlines[i].label;
                            return this.onSelected(i);
                        }
                    }
                }
                let index = (nowCdn + 1) % playlines.length;
                localStorage["cdn"] = playlines[index].label;
                return this.onSelected(index);
            }, 2000);
            return ret;
        });
    }

    /**
     * 操作方法
     */
    protected Api() {
        (<any>Application.GlobalContext).sendTimePack = (time: number, callback: Function) => {
            if (time == NaN || time == undefined) {
                time = parseInt(this.param.duration);
            }
            let playTime = Math.round(time || (this.param.duration - randNumber(1, 2)));
            let enc = '[' + this.param.clazzId + '][' + this.param.userid + '][' +
                this.param.jobid + '][' + this.param.objectId + '][' +
                (playTime * 1000).toString() + '][d_yHJ!$pdA~5][' + (this.param.duration * 1000).toString() + '][0_' +
                this.param.duration + ']';
            enc = (<any>Application.GlobalContext).md5(enc);
            get(this.param.reportUrl + '/' + this.param.dtoken + '?clipTime=0_' + this.param.duration +
                '&otherInfo=' + this.param.otherInfo +
                '&userid=' + this.param.userid + '&rt=0.9&jobid=' + this.param.jobid +
                '&duration=' + this.param.duration + '&dtype=Video&objectId=' + this.param.objectId +
                '&clazzId=' + this.param.clazzId +
                '&view=pc&playingTime=' + playTime + '&isdrag=4&enc=' + enc, function (data: string) {
                    let isPassed = JSON.parse(data);
                    callback(isPassed.isPassed);
                });
        }
    }

}

export class CxVideoControlBar extends CxTaskControlBar {
    public defaultBtn() {
        super.defaultBtn();
        let pass = CssBtn(createBtn("秒过视频", "秒过视频会被后台检测到", "cx-btn"));
        let downloadSubtitle = CssBtn(createBtn("下载字幕", "我要下载字幕一同食用"));
        pass.style.background = "#F57C00";
        downloadSubtitle.style.background = "#638EE1";
        this.prev.append(pass, this.download(), downloadSubtitle);
        pass.onclick = () => {
            if (!protocolPrompt("秒过视频会产生不良记录,是否继续?", "boom_no_prompt")) {
                return;
            }
            (<Video>this.task).sendEndTimePack((isPassed: boolean) => {
                if (isPassed) {
                    alert('秒过成功,刷新后查看效果');
                } else {
                    alert('操作失败,错误');
                }
            });
        };
        downloadSubtitle.onclick = () => {
            (<Video>this.task).downloadSubtitle();
        }
    }

}

export class Video extends CxTask {
    protected video: HTMLVideoElement;
    protected _playbackRate: number;
    protected _muted: boolean;
    protected flash: boolean;
    protected time: NodeJS.Timer;
    protected end: boolean;

    protected queryVideo(): HTMLVideoElement {
        return this.context.document.getElementById("video_html5_api");
    }

    public Init(): Promise<any> {
        return new Promise(resolve => {
            Application.App.log.Debug("播放器配置", this.taskinfo);
            let timer = this.context.setInterval(() => {
                try {
                    let video = this.queryVideo();
                    if (video == undefined) {
                        if (this.context.document.querySelector("#reader").innerHTML.indexOf("您没有安装flashplayer") >= 0) {
                            this.context.clearInterval(timer);
                            this.flash = true;
                            resolve(undefined);
                        }
                        return;
                    }
                    this.context.clearInterval(timer);
                    this.video = video;
                    this.initPlayer();
                    this.video.addEventListener("ended", () => {
                        this.end = true;
                        this.context.clearInterval(this.time);
                        this.callEvent("complete");
                    });
                    resolve(undefined);
                } catch (error) {
                    Application.App.log.Debug("初始化video错误", error);
                }
            }, 500);
        });
    }

    public Type(): TaskType {
        return "video";
    }

    public Start(): Promise<any> {
        return new Promise(resolve => {
            Application.App.log.Debug("开始播放视频");
            if (this.flash) {
                resolve(undefined);
                return this.callEvent("complete");
            }
            //定时运行
            this.time = this.context.setInterval(() => {
                Application.App.config.auto && this.video.paused && this.video.play();
            }, 5000);
            //同时运行多视频的兼容,后续看看能不能hook
            this.video.addEventListener("pause", () => {
                if (this.video.currentTime <= this.video.duration - 5) {
                    if (!this.end) {
                        this.video.play();
                    }
                }
            });
            this.video.play();
            resolve(undefined);
        });
    }

    protected initPlayer() {
        this.playbackRate = this._playbackRate;
        this.muted = this._muted;
    }

    /**
     * 秒过
     */
    public sendEndTimePack(callback: Function) {
        this.sendTimePack(this.video.duration, callback);
    }

    public sendTimePack(time: number, callback: Function) {
        this.context.sendTimePack(time, function (isPassed: any) {
            callback(isPassed);
        });
    }

    public downloadSubtitle() {
        get('/richvideo/subtitle?mid=' + this.taskinfo.property.mid + '&_dc=' +
            Date.parse(new Date().toString()), function (data: any) {
                let json = JSON.parse(data);
                if (json.length <= 0) {
                    alert("没有字幕！");
                } else {
                    for (let i = 0; i < json.length; i++) {
                        let subtitleURL = json[i]['url'];
                        window.open(subtitleURL);
                    }
                }
            });
    }

    /**
     * 设置播放速度
     */
    public set playbackRate(speed: number) {
        this._playbackRate = speed;
        if (this.video) {
            this.video.playbackRate = speed;
        }
    }

    /**
     * 设置播放静音
     */
    public set muted(muted: boolean) {
        this._muted = muted;
        if (this.video) {
            this.video.muted = muted;
        }
    }
}
