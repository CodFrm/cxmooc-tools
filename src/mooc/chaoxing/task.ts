import { createBtn } from "@App/internal/utils/utils";
import { Application } from "@App/internal/application";
const css = require("@App/views/common.css");

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
    public CreateTask(context: any, taskinfo: any): Task {
        this.taskIframe = (<Window>context).document.querySelector(
            "iframe[jobid='" + taskinfo.jobid + "']"
        );
        this.createActionBtn();
        let task = new Video(this.taskIframe.contentWindow, taskinfo);
        task.playerOptimization(Application.App.config.danmu);
        task.muted = Application.App.config.video_mute;
        task.playbackRate = Application.App.config.video_multiple;

        return task;
    }

    protected createActionBtn() {
        let prev = <HTMLElement>this.taskIframe.previousElementSibling;
        prev.style.textAlign = "center";
        prev.style.width = "100%";
        let startBtn = createBtn("开始挂机", "点击开始自动挂机播放视频", "cx-btn");
        let pass = createBtn("秒过视频", "秒过视频会被后台检测到", "cx-btn");
        let download = createBtn("下载视频", "我要下载视频好好学习", "cx-btn");
        pass.style.background = "#F57C00";
        download.style.background = "#999999";
        prev.append(startBtn);
        prev.append(pass);
        prev.append(download);
    }
}

export class Video extends Task {
    protected video: HTMLVideoElement;
    protected _playbackRate: number;
    protected _muted: boolean;

    public Init(context: any, taskinfo: any) {
        super.Init(context, taskinfo);
        Application.App.log.Debug("播放器配置", this.taskinfo);
        context.onload = () => {
            this.video = <HTMLVideoElement>document.getElementById("video_html5_api");
            this.playbackRate = this._playbackRate; this._muted = this._muted;
        };
    }

    public playerOptimization(danmu: boolean) {
        if (danmu && this.taskinfo.property.danmaku == 1) {
            this.taskinfo.property.danmaku = 0;
        }
        this.context.frameElement.setAttribute(
            "data",
            (<any>window).Ext.encode(this.taskinfo.property)
        );
        this.context.frameElement.setAttribute("switchwindow", "false");
        this.context.frameElement.setAttribute("fastforward", "false");
    }

    public setEndVideo() {

    }

    public set playbackRate(speed: number) {
        this._playbackRate = speed;
        if (this.video) {
            this.video.playbackRate = speed;
        }
    }

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
