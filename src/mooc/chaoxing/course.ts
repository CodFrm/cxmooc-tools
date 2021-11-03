import {Application} from "@App/internal/application";
import {CxTask} from "@App/mooc/chaoxing/task";
import {TaskFactory} from "@App/mooc/chaoxing/factory";
import {Mooc, MoocTaskSet, MoocEvent} from "@App/internal/app/mooc";
import {Task} from "@App/internal/app/task";
import {EventListener} from "@App/internal/utils/event";

//课程任务
export class CxCourse extends EventListener<MoocEvent> implements MoocTaskSet {

    protected taskList: Array<CxTask>;
    protected attachments: Array<any>;

    public Init(): Promise<any> {
        return new Promise(resolve => {
            let first = true;
            document.addEventListener("load", ev => {
                let el = <HTMLIFrameElement>(ev.srcElement || ev.target);
                if (el.id == "iframe") {
                    Application.App.log.Info("超星新窗口加载");
                    this.OperateCard(el);
                    // 超星会有多次加载,所以使用一个flag变量,只回调一次
                    first && resolve(undefined);
                    first = false;
                }
            }, true);
        });
    }

    public Stop(): Promise<any> {
        throw new Error("Method not implemented.");
    }

    protected taskIndex: number = 0;

    public Next(): Promise<Task> {
        return new Promise(resolve => {
            if (this.taskList.length > this.taskIndex) {
                resolve(this.taskList[this.taskIndex]);
                return this.taskIndex++;
            }
            // 当页任务点全部结束,翻页.由于会重新加载窗口调用reload,在加载完成之后再返回任务点.(本方法是同步调用,所以使用此种方法)
            this.addEventListenerOnce("reload", async () => {
                resolve(await this.Next());
            })
            this.nextPage(null);
        });
    }

    public SetTaskPointer(index: number): void {
        this.taskIndex = index;
    }

    // 操作任务卡,一个页面会包含很多任务,取出来
    public async OperateCard(iframe: HTMLIFrameElement) {
        let iframeWindow: any = iframe.contentWindow;
        // 判断任务的参数
        if (iframeWindow.mArg == undefined) {
            let match = iframeWindow.document.body.innerHTML.match(/try{\s+?mArg = (.*?);/);
            if (!match) {
                return;
            }
            iframeWindow.mArg = JSON.parse(match[1]);
        }
        // 任务的属性
        this.attachments = <Array<any>>iframeWindow.mArg.attachments;
        this.taskList = new Array();
        // 构建任务
        for (let index = 0; index < this.attachments.length; index++) {
            let value = this.attachments[index];
            value.defaults = <Array<any>>iframeWindow.mArg.defaults;
            let task: CxTask;
            // 任务工厂去创建对应的任务对象
            task = TaskFactory.CreateCourseTask(iframeWindow, value);
            if (!task) {
                continue;
            }
            task.jobIndex = index;
            this.taskList.push(task);
            task.addEventListener("complete", () => {
                this.callEvent("taskComplete", index, task);
            });
            await task.Init();
        }
        this.taskIndex = 0;
        this.callEvent("reload");
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

    protected nextPage(num: number) {
        let el = <HTMLElement>document.querySelector("span.currents ~ span") || <HTMLElement>document.querySelector(".prev_next.next");
        if (el != undefined) {
            return el.click();
        }
        //只往后执行
        el = this.afterPage();
        if (el == undefined) {
            //进行有锁任务查找
            if (document.querySelector("div.ncells > *:not(.currents) > .lock") == undefined) {
                return this.callEvent("complete");
            }
            return setTimeout(() => {
                if (num > 5) {
                    return this.callEvent("error", "被锁卡住了,请手动处理");
                }
                Application.App.log.Info("等待解锁");
                this.nextPage(num + 1);
            }, 5000);
        }
        (<any>el.parentElement.querySelector("a>span")).click();
    }
}

// 考试
export class CxExamTopic implements Mooc {
    public Init(): any {
        window.addEventListener("load", () => {
            let el = <HTMLInputElement>document.querySelector("#paperId");
            let info = "0";
            if (el) {
                info = el.value;
            }
            let task = TaskFactory.CreateExamTopicTask(window, {
                refer: document.URL,
                id: "exam-" + info,
                info: info,
            });
            task.Init();
            if (document.URL.indexOf("exam/test/reVersionTestStartNew") > 0) {
                if (Application.App.config.auto) {
                    task.Start();
                }
            }
        });
    }
}

// 作业
export class CxHomeWork implements Mooc {
    public Init(): any {
        window.onload = () => {
            let el = (<HTMLInputElement>document.querySelector("#workLibraryId"));
            let info = "";
            if (el) {
                info = el.value;
            }
            let task = TaskFactory.CreateHomeworkTopicTask(window, {
                refer: document.URL,
                id: info,
                info: info,
            });
            task.Init();
            if (Application.App.config.auto && <HTMLInputElement>document.querySelector("#workLibraryId")) {
                task.Start();
            }
        }
    }
}
