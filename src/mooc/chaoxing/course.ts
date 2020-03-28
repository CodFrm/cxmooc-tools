import {Mooc} from "../factory";
import {Application} from "@App/internal/application";
import {substrex} from "@App/internal/utils/utils";
import {Task} from "@App/mooc/chaoxing/task";
import {TaskFactory} from "@App/mooc/chaoxing/factory";

//课程任务
export class CxCourse implements Mooc {

    protected taskList: Array<Task>;
    protected attachments: Array<any>;
    protected timer: NodeJS.Timer;

    public Start(): void {
        document.addEventListener("load", ev => {
            var el = <HTMLIFrameElement>(ev.srcElement || ev.target);
            if (el.id == "iframe") {
                Application.App.log.Info("超星新窗口加载");
                clearTimeout(this.timer);
                this.OperateCard(el);
            }
        }, true);
    }

    public async OperateCard(iframe: HTMLIFrameElement) {
        let iframeWindow: any = iframe.contentWindow;
        if (iframeWindow.mArg == undefined) {
            let margStr = "mArg=" + iframeWindow.document.body.innerHTML.match(/try{\s+?mArg = (.*?);/)[1];
            iframeWindow.mArg = eval(margStr);
        }
        this.attachments = <Array<any>>iframeWindow.mArg.attachments;
        this.taskList = new Array();
        for (let index = 0; index < this.attachments.length; index++) {
            let value = this.attachments[index];
            if (value.jobid == undefined) {
                continue
            }
            let task: Task;
            task = TaskFactory.CreateCourseTask(iframeWindow, value);
            if (!task) {
                continue;
            }
            task.jobIndex = index;
            this.taskList.push(task);
            let taskIndex = this.taskList.length - 1;
            task.Load(() => {
            });
            task.Complete(async () => {
                this.startTask(taskIndex + 1, task);
            });
            await task.Init();
        }
        Application.App.log.Debug("任务点参数", this.attachments);
        this.startTask(0, null);
    }

    protected async startTask(index: number, nowtask: Task) {
        if (Application.App.config.auto) {
            //选择未完成的任务点开始
            let task: Task;
            for (let i = index; i < this.taskList.length; i++) {
                task = this.taskList[i];
                if (this.attachments[task.jobIndex].job) {
                    if (index == 0) {
                        task.Start();
                    } else {
                        this.delay(async () => {
                            nowtask && await nowtask.Submit();
                            task.Start();
                        });
                    }
                    return;
                }
            }
            this.nextPage(null, nowtask);
        }
    }

    protected delay(func: Function) {
        let interval = Application.App.config.interval;
        Application.App.log.Info(interval + "分钟后自动切换下一个任务点");
        this.timer = setTimeout(() => {
            Application.App.config.auto && func();
        }, interval * 60000);
    }

    protected afterPage(): HTMLElement {
        //感觉奇葩的方法...
        let els = document.querySelectorAll("div.ncells > *:not(.currents) > .orange01");
        let now = <HTMLElement>document.querySelector("div.ncells > .currents");
        for (let i = 0; i < els.length; i++) {
            if (now.getBoundingClientRect().top < els[i].getBoundingClientRect().top) {
                return <HTMLElement>els[i];
            }
        }
        return null;
    }

    protected nextPage(num: number, task: Task) {
        if (num == null) {
            return this.delay(async () => {
                task && await task.Submit();
                this.nextPage(0, null);
            });
        }
        let el = <HTMLElement>document.querySelector("span.currents ~ span");
        if (el != undefined) {
            return el.click();
        }
        //只往后执行
        el = this.afterPage();
        if (el == undefined) {
            //进行有锁任务查找
            if (document.querySelector("div.ncells > *:not(.currents) > .lock") == undefined) {
                Application.App.log.Warn("任务结束了");
                return alert("任务结束了");
            }
            return setTimeout(() => {
                if (num > 5) {
                    Application.App.log.Fatal("被锁卡住了,请手动处理");
                    return alert("被锁卡住了,请手动处理");
                }
                Application.App.log.Info("等待解锁");
                this.nextPage(num + 1, null);
            }, 5000);
        }
        (<any>el.parentElement.querySelector("a>span")).click();
    }
}

//TODO: 考试和作业强制采集
export class CxExamTopic implements Mooc {
    public Start(): void {
        window.onload = () => {
            let task = TaskFactory.CreateExamTopicTask(window, {
                refer: document.URL,
                id: substrex(document.URL, "courseId=", "&"),
                info: (<HTMLInputElement>document.querySelector("#paperId")).value,
            });
            task.Init();
            if (document.URL.indexOf("exam/test/reVersionTestStartNew") > 0) {
                if (Application.App.config.auto) {
                    task.Start();
                }
            }
        }
    }
}

export class CxHomeWork implements Mooc {
    public Start(): void {
        window.onload = () => {
            let task = TaskFactory.CreateHomeworkTopicTask(window, {
                refer: document.URL,
                id: substrex(document.URL, "&workId=", "&"),
                info: (<HTMLInputElement>document.querySelector("#workLibraryId") || <HTMLInputElement>document.querySelector("#cid")).value
            });
            task.Init();
            if (Application.App.config.auto && <HTMLInputElement>document.querySelector("#workLibraryId")) {
                task.Start();
            }
        }
    }
}
