import { Mooc, MoocFactory } from "../factory";
import { Task, TaskFactory } from "./task";
import { Application } from "@App/internal/application";
import { VideoFactory } from "./video";
import { TopicFactory } from "./topic";
export class CxCourseFactory implements MoocFactory {
    public CreateMooc(): Mooc {
        return new CxCourse();
    }
}

//课程任务
export class CxCourse implements Mooc {

    protected taskList: Array<Task>;
    protected attachments: Array<any>;

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
        this.attachments = <Array<any>>iframeWindow.mArg.attachments;
        this.taskList = new Array();
        let loadOverNum = 0;
        this.attachments.forEach((value: any, index: number) => {
            if (value.jobid == undefined) {
                return;
            }
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
            task.jobIndex = index;
            this.taskList.push(task);
            let taskIndex = this.taskList.length - 1;
            task.Load(() => {
                if (++loadOverNum == this.taskList.length) {
                    this.startTask(0);
                }
            });
            task.Complete(() => {
                this.taskComplete(taskIndex, index);
            });
        });
        Application.App.log.Debug("任务点参数", this.attachments);
        if (this.taskList.length == 0) {
            this.nextPage();
        }
    }

    protected taskComplete(taskIndex: number, index: number) {
        if (index == this.attachments.length - 1) {
            //本页最后一个任务完成
            return this.nextPage();
        }
        this.startTask(taskIndex + 1);
    }

    protected startTask(index: number) {
        if (Application.App.config.auto) {
            //选择未完成的任务点开始
            let task: Task;
            for (let i = index; i < this.taskList.length; i++) {
                task = this.taskList[i];
                if (this.attachments[task.jobIndex].job) {
                    if (index == 0) {
                        task.Start();
                    } else {
                        this.delay(task.Start);
                    }
                    return;
                }
            }
            this.nextPage();
        }
    }

    protected delay(func: Function) {
        let interval = Application.App.config.interval;
        Application.App.log.Info(interval + "分钟后自动切换下一个任务点");
        setTimeout(func, interval * 60000);
    }

    protected nextPage(num?: number) {
        if (num == undefined) {
            return this.delay(() => { this.nextPage(0); });
        }
        let el = <HTMLElement>document.querySelector("span.currents ~ span");
        if (el != undefined) {
            return el.click();
        }
        el = <HTMLElement>document.querySelector("div.ncells > *:not(.currents) > .orange01");
        if (el == undefined) {
            //进行有锁任务查找
            if (document.querySelector("div.ncells > *:not(.currents) > .lock") == undefined) {
                return alert("任务结束了");
            }
            return setTimeout(() => {
                if (num > 5) {
                    return alert("被锁卡住了,请手动处理");
                }
                this.nextPage(num + 1);
            }, 5000);
        }
        el.click();
    }

}

