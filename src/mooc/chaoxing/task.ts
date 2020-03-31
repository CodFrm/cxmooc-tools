import {CssBtn} from "@App/mooc/chaoxing/utils";
import {createBtn} from "@App/internal/utils/utils";
import {Application} from "@App/internal/application";

export abstract class Task {
    public jobIndex: number;
    public taskinfo: any;
    protected context: any;
    protected completeCallback: () => void;
    protected loadCallback: () => void;

    public constructor(context: any, taskinfo: any) {
        this.taskinfo = taskinfo;
        this.context = context;
    }

    public Complete(callback: () => void): void {
        this.completeCallback = callback;
    }

    public Init(): Promise<any> {
        return new Promise(resolve => {
            resolve();
        });
    }

    public Load(callback: () => void): void {
        this.loadCallback = callback;
    }

    public abstract Start(): void

    public Submit(): Promise<void> {
        return new Promise(resolve => {
            resolve();
        });
    }
}

export class CxTaskControlBar {
    public task: Task;
    protected prev: HTMLElement;

    constructor(prev: HTMLElement, task: Task) {
        this.task = task;
        this.prev = document.createElement("div");
        prev.style.textAlign = "center";
        prev.style.width = "100%";
        prev.prepend(this.prev);
        this.defaultBtn();
    }

    public defaultBtn() {
        let startBtn = CssBtn(createBtn(Application.App.config.auto ? "挂机中..." : "开始挂机", "点击开始自动挂机", "cx-btn"));
        startBtn.onclick = () => {
            if (startBtn.innerText == '挂机中...') {
                Application.App.config.auto = false;
                startBtn.innerText = "开始挂机";
                startBtn.title = "点击开始自动挂机";
                Application.App.log.Info("挂机停止了");
            } else {
                Application.App.config.auto = true;
                startBtn.innerText = '挂机中...';
                startBtn.title = "停止挂机,开始好好学习";
                Application.App.log.Info("挂机开始了");
                this.task.Start();
            }
        };
        this.prev.append(startBtn);
    }

    protected download(): HTMLElement {
        if (!this.task.taskinfo.objectId) {
            return;
        }
        let download = CssBtn(createBtn("下载资源", "我要下载下来好好学习", "cx-btn"));
        download.style.background = "#999999";
        download.onclick = () => {
            window.open("http://d0.ananas.chaoxing.com/download/" + this.task.taskinfo.objectId);
        }
        return download;
    }
}