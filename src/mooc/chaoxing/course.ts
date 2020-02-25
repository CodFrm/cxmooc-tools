import { Mooc, MoocFactory } from "../factory";
import { Task, VideoFactory, TaskFactory, TopicFactory } from "./task";
import { Application } from "@App/internal/application";
import { Hook, Context } from "@App/internal/utils/hook";
import { randNumber, get } from "@App/internal/utils/utils";
export class CxCourseFactory implements MoocFactory {
    public CreateMooc(): Mooc {
        return new CxCourse();
    }
}

//课程任务
export class CxCourse implements Mooc {

    public Start(): void {
        document.addEventListener("load", ev => {
            var el = <HTMLIFrameElement>(ev.srcElement || ev.target);
            if (el.id == "iframe") {
                Application.App.log.Info("超星新窗口加载");
                this.OperateCard(el);
            }
        }, true);
    }

    public OperateCard(iframe: HTMLIFrameElement) {
        let iframeWindow: any = iframe.contentWindow;
        let attachments = <Array<any>>iframeWindow.mArg.attachments;
        attachments.forEach((value: any, index: number) => {
            let task: Task;
            let taskFactory: TaskFactory;
            switch (value.type) {
                case "video": {
                    taskFactory = new VideoFactory();
                    break;
                }
                case "workid": {
                    taskFactory = new TopicFactory();
                    break;
                }
                default:
                    return;
            }
            task = taskFactory.CreateTask(iframeWindow, value);
            task.Complete(() => {
                this.taskComplete(task, index);
            });
        });
        Application.App.log.Debug("任务点参数", attachments);
    }

    protected taskComplete(task: Task, index: number) { }
}


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
                if (ret.danmaku == 1) {
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
                ret.autoplay = true;
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
            Application.App.log.Info("send time pack");
            console.log(this.param);
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
