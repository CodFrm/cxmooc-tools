import { createBtn } from "@App/internal/utils/utils";
import { Application } from "@App/internal/application";
import { Hook, Context } from "@App/internal/utils/hook";
import { CssBtn } from "./utils";

export interface TaskFactory {
    CreateTask(context: any, taskinfo: any): Task;
}

export abstract class Task {
    protected taskinfo: any;
    protected context: any;
    protected completeCallback: () => void;

    public constructor(context: any, taskinfo: any) {
        this.Init(context, taskinfo);
    }
    public Complete(callback: () => void): void {
        this.completeCallback = callback;
    }

    public Init(context: any, taskinfo: any): void {
        this.taskinfo = taskinfo;
        this.context = context;
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
        startBtn.onclick = () => { };
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
                this.video = video;
                this.video.onplay = () => {
                    this.initPlayer();
                }
                this.context.clearInterval(timer);
            } catch (error) {
            }
        }, 500);
    }

    protected initPlayer() {
        this.playbackRate = this._playbackRate; this._muted = this._muted;
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

export class TopicFactory implements TaskFactory {
    CreateTask(context: any, taskinfo: any): Task {
        throw new Error("Method not implemented.");
    }
}

export class Topic extends Task { }
