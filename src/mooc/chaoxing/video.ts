import { MoocFactory, Mooc } from "../factory";
import { Hook, Context } from "@App/internal/utils/hook";
import { Application } from "@App/internal/application";
import { randNumber, get, createBtn } from "@App/internal/utils/utils";
import { TaskFactory, Task } from "./task";
import { CssBtn } from "./utils";

export class CxVideoOptimizationFactory implements MoocFactory {
    CreateMooc(): Mooc {
        return new CxVideoOptimization();
    }
}

// 优化播放器
export class CxVideoOptimization implements Mooc {

    protected taskinfo: any;
    protected param: any;

    public Start(): void {
        //对播放器进行优化
        document.addEventListener("readystatechange", () => {
            if (document.readyState != "interactive") {
                return;
            }
            let dataHook = new Hook("decode", (<any>window).Ext);
            dataHook.Middleware((next: Context, ...args: any) => {
                let ret = next.apply(this, args);
                if (Application.App.config.super_mode && ret.danmaku == 1) {
                    ret.danmaku = 0;
                }
                return ret;
            });
            window.frameElement.setAttribute("fastforward", "");
            window.frameElement.setAttribute("switchwindow", "");

            let paramHook = new Hook("params2VideoOpt", (<any>window).ans.VideoJs.prototype);
            paramHook.Middleware((next: Context, ...args: any) => {
                this.param = args[0];
                let ret = next.apply(this, args);
                ret.plugins.timelineObjects.url = this.param.rootPath + "/richvideo/initdatawithviewer";
                return ret;
            });
            (<any>window).Ext.isSogou = false;

            let errorHook = new Hook("afterRender", (<any>window).ans.videojs.ErrorDisplay.prototype);
            errorHook.Middleware(function (next: Context, ...args: any) {
                let ret = next.apply(this, args);
                setTimeout(() => {
                    let nowCdn = this.renderData.selectedIndex;
                    let playlines = this.renderData.playlines;
                    let cdn = Application.App.config.video_cdn || "公网1";
                    for (let i = 0; i < playlines.length; i++) {
                        if (i != nowCdn) {
                            if (cdn == "") {
                                return this.onSelected(i);
                            } else if (cdn == playlines[i].label) {
                                return this.onSelected(i);
                            }
                        }
                    }
                    return this.onSelected((nowCdn + 1) % playlines.length);
                }, 2000);
                return ret;
            });
        });
        this.Api();
    }

    /**
     * 操作方法
     */
    protected Api() {
        (<any>window).sendTimePack = (time: number, callback: Function) => {
            if (time == NaN || time == undefined) {
                time = parseInt(this.param.duration);
            }
            let playTime = Math.round(time || (this.param.duration - randNumber(1, 2)));
            let enc = '[' + this.param.clazzId + '][' + this.param.userid + '][' +
                this.param.jobid + '][' + this.param.objectId + '][' +
                (playTime * 1000).toString() + '][d_yHJ!$pdA~5][' + (this.param.duration * 1000).toString() + '][0_' +
                this.param.duration + ']';
            enc = (<any>window).md5(enc);
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

export class VideoFactory implements TaskFactory {
    protected taskIframe: HTMLIFrameElement;
    protected task: Video
    public CreateTask(context: any, taskinfo: any): Task {
        this.taskIframe = (<Window>context).document.querySelector(
            "iframe[jobid='" + taskinfo.jobid + "']"
        );
        this.createActionBtn();
        this.task = new Video(this.taskIframe.contentWindow, taskinfo);
        this.task.muted = Application.App.config.video_mute;
        this.task.playbackRate = Application.App.config.video_multiple;
        return this.task;
    }

    protected createActionBtn() {
        let prev = <HTMLElement>this.taskIframe.previousElementSibling;
        prev.style.textAlign = "center";
        prev.style.width = "100%";
        let startBtn = CssBtn(createBtn("开始挂机", "点击开始自动挂机播放视频", "cx-btn"));
        let pass = CssBtn(createBtn("秒过视频", "秒过视频会被后台检测到", "cx-btn"));
        let download = CssBtn(createBtn("下载视频", "我要下载视频好好学习", "cx-btn"));
        pass.style.background = "#F57C00";
        download.style.background = "#999999";
        prev.append(startBtn);
        prev.append(pass);
        prev.append(download);
        // 绑定事件
        startBtn.onclick = () => {
            this.task.Start();
        };
        pass.onclick = () => {
            if (localStorage['boom_no_prompt'] == undefined || localStorage['boom_no_prompt'] != 1) {
                let msg = prompt('秒过视频会产生不良记录,是否继续?如果以后不想再弹出本对话框请在下方填写yes')
                if (msg === null) return;
                if (msg === 'yes') localStorage['boom_no_prompt'] = 1;
            }
            this.task.sendEndTimePack((isPassed: boolean) => {
                if (isPassed) {
                    alert('秒过成功,刷新后查看效果');
                } else {
                    alert('操作失败,错误');
                }
            });
        };
        download.onclick = () => {
            this.task.download();
        };
    }
}

export class Video extends Task {
    protected video: HTMLVideoElement;
    protected _playbackRate: number;
    protected _muted: boolean;

    public Init(context: any, taskinfo: any) {
        super.Init(context, taskinfo);
        Application.App.log.Debug("播放器配置", this.taskinfo);
        let timer = this.context.setInterval(() => {
            try {
                let video = this.context.document.getElementById("video_html5_api");
                if (video == undefined) {
                    return;
                }
                this.context.clearInterval(timer);
                this.video = video;
                this.initPlayer();
                this.video.addEventListener("ended", () => {
                    this.completeCallback && this.completeCallback();
                });
                this.loadCallback && this.loadCallback();
            } catch (error) {
            }
        }, 500);
    }

    public Start(): void {
        this.video.onloadstart = () => {
            this.video.play();
        }
        this.video.play();
    }

    protected initPlayer() {
        this.playbackRate = this._playbackRate; this.muted = this._muted;
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

    public download() {
        window.open(this.video.src);
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
