import {CxTaskControlBar, CxTask} from "@App/mooc/chaoxing/task";
import {createBtn, get, isPhone, protocolPrompt, randNumber} from "@App/internal/utils/utils";
import {Application} from "@App/internal/application";
import {CxVideoOptimization, Video} from "@App/mooc/chaoxing/video";
import {CssBtn} from "@App/mooc/chaoxing/utils";
import {Context, Hook} from "@App/internal/utils/hook";
import {TaskType} from "@App/internal/app/task";

export class CxDocumentTask extends CxTask {
    protected time: NodeJS.Timer;

    public Start(): Promise<any> {
        return new Promise(resolve => {
            let next = () => {
                let el = this.context.document.querySelector(".imglook > .mkeRbtn");
                if (el.style.visibility == "hidden") {
                    this.callEvent("complete");
                    return;
                }
                el.click();
                this.time = this.context.setTimeout(next, randNumber(1, 5) * 1000);
                resolve();
            };
            this.time = this.context.setTimeout(next, randNumber(1, 5) * 1000);
        });
    }

    public Type(): TaskType {
        return "document";
    }

}

export class CxAudioOptimization extends CxVideoOptimization {

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
        Application.App.log.Debug("hook cx audio");
        let self = this;
        let paramHook = new Hook("params2VideoOpt", (<any>Application.GlobalContext).ans.AudioJs.prototype);
        paramHook.Middleware(function (next: Context, ...args: any) {
            self.param = args[0];
            return next.apply(this, args);
        });
        (<any>Application.GlobalContext).Ext.isSogou = false;
    }

}

export class CxAudioTask extends Video {

    protected queryVideo(): HTMLVideoElement {
        return this.context.document.getElementById("audio_html5_api");
    }

}


export class CxAudioControlBar extends CxTaskControlBar {
    public defaultBtn() {
        super.defaultBtn();
        let pass = CssBtn(createBtn("秒过嘤频", "秒过会被后台检测到", "cx-btn"));
        pass.style.background = "#F57C00";
        pass.onclick = () => {
            if (!protocolPrompt("秒过会产生不良记录,是否继续?", "boom_audio_no_prompt")) {
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
        this.prev.append(pass, this.download());
    }
}
