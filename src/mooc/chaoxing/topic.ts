import { TaskFactory, Task } from "./task";
import { CssBtn, CreateNoteLine } from "./utils";
import { createBtn, substrex, removeHTML } from "@App/internal/utils/utils";
import { Application } from "@App/internal/application";
import { Question, Option, QuestionList, TopicType, SwitchTopicType, TopicStatus, TopicStatusString, QuestionStatus } from "@App/internal/utils/question";

export class TopicFactory implements TaskFactory {
    protected taskIframe: HTMLIFrameElement;
    protected task: Topic;
    CreateTask(context: any, taskinfo: any): Task {
        this.taskIframe = (<Window>context).document.querySelector(
            "iframe[jobid='" + taskinfo.jobid + "']"
        );
        this.createActionBtn();
        this.task = new Topic((<HTMLIFrameElement>this.taskIframe.contentWindow.document.querySelector("#frame_content")).contentWindow, taskinfo);
        return this.task;
    }

    protected createActionBtn() {
        let prev = <HTMLElement>this.taskIframe.previousElementSibling;
        prev.style.textAlign = "center";
        prev.style.width = "100%";
        let topic = CssBtn(createBtn("搜索题目", "点击开始自动答题", "cx-btn"));
        prev.append(topic);
        // 绑定事件
        topic.onclick = () => {
            this.task.Start();
        };
    }
}

export class Topic extends Task {

    protected lock: boolean;

    public Init(context: any, taskinfo: any) {
        super.Init(context, taskinfo);
        Application.App.log.Debug("题目", this.taskinfo, this.context.document.readyState);
        let timer = this.context.setInterval(() => {
            if (this.context.document.readyState == "complete") {
                clearInterval(timer);
                this.loadCallback && this.loadCallback();
            }
        }, 500);
    }

    public Start(): void {
        if (this.lock) { return; }
        this.lock = true;
        Application.App.log.Info("题目搜索中...");
        let timu = <Array<HTMLElement>>this.context.document.querySelectorAll(".TiMu");
        let list = new QuestionList("cx");
        timu.forEach((val, index) => {
            let topic = new cxTopic(val);
            if (topic.GetType() == null) {
                return;
            }
            list.AddTopic(topic);
        });
        list.Answer((status: QuestionStatus) => {
            this.lock = false;
            if (status == "network") {
                return Application.App.log.Info("网络错误跳过");
            } else if (status == "incomplete") {
                return Application.App.log.Info("答案错误");
            }
            Application.App.log.Info("准备提交答案");
            this.context.setTimeout(() => {
                let submit = this.context.document.querySelector(".Btn_blue_1");
                submit.click();
                this.context.setTimeout(() => {
                    let prompt = this.context.document.querySelector("#tipContent").innerHTML;
                    if (prompt.indexOf("未做完") > 0) {
                        alert("提示:" + prompt);
                        return;
                    }
                    let timer = this.context.setInterval(() => {
                        prompt = document.getElementById("validate");
                        if (prompt.style.display != 'none') {
                            //等待验证码接管
                            return;
                        }
                        clearInterval(timer);
                        //确定提交
                        let submit = this.context.document.querySelector(".bluebtn");
                        Application.App.prod && submit.click();

                        this.completeCallback && this.completeCallback();

                    }, 2000);
                }, 2000);
            }, 2000);
        });
    }

}

interface Notice {
    RemoveNotice(): void
    AddNotice(str: string): void
}
class cxTopic implements Question, Notice {

    protected el: HTMLElement;
    protected options: Array<Option>;

    constructor(el: HTMLElement) {
        this.el = el;
    }
    public SetStatus(status: TopicStatus) {
        this.RemoveNotice();
        this.AddNotice(TopicStatusString(status));
    }

    public GetTopic(): string {
        let ret = this.el.querySelector(".Zy_TItle > .clearfix").innerHTML;
        return ret.substring(ret.indexOf('】') + 1);
    }

    public RemoveNotice() {
        let el = <HTMLElement>this.el.querySelector(".clearfix > ul,.clearfix > .Py_tk");
        el.querySelectorAll(".prompt-line-answer").forEach((v, i) => { v.remove() });
    }

    public AddNotice(str: string) {
        let el = <HTMLElement>this.el.querySelector(".clearfix > ul,.clearfix > .Py_tk");
        CreateNoteLine(str, "answer", el);
    }

    public GetType(): TopicType {
        let title = this.el.querySelector(".Zy_TItle.clearfix > .clearfix").innerHTML;
        let ret = SwitchTopicType(substrex(title, '【', '】'));
        this.RemoveNotice();
        if (ret == null) {
            this.AddNotice("不支持的类型");
        }
        return ret;
    }

    public GetOption(): Array<Option> {
        if (this.options != null) {
            return this.options;
        }
        let el = <HTMLElement>this.el.querySelector(".clearfix > ul,.clearfix ul.Zy_ulBottom.clearfix");
        let list = el.querySelectorAll("li");
        let options = new Array<Option>();
        list.forEach((val, index) => {
            switch (this.GetType()) {
                case 1:
                case 2: {
                    options.push(new cxSelectOption(val, this));
                    break;
                }
                case 3: {
                    options.push(new cxJudgeOption(val, this));
                    break;
                }
                case 4: {
                    options.push(new cxFillOption(val, this));
                    break;
                }
            }
        });
        this.options = options;
        return options;
    }

}

abstract class cxOption implements Option {

    protected el: HTMLElement;
    protected notice: Notice;
    constructor(el: HTMLElement, notice: Notice) {
        this.el = el;
        this.notice = notice;
    }

    abstract Fill(content: string | boolean): void
    abstract GetContent(): string | boolean
    abstract GetOption(): string
}

class cxSelectOption extends cxOption {

    public Fill(content: string): void {
        let el = <HTMLInputElement>this.el.querySelector("label > input");
        el.click();
        this.notice.AddNotice(this.GetOption() + ":" + content);
    }

    public GetContent(): string {
        let el = this.el.querySelector("a");
        return el.innerHTML;
    }

    public GetOption(): string {
        return this.el.querySelector("input").value;
    }
}

class cxJudgeOption extends cxOption {

    public Fill(content: boolean): void {
        let el = <HTMLInputElement>this.el.querySelector("label > input");
        el.click();
        if (content) {
            return this.notice.AddNotice("对√");
        }
        return this.notice.AddNotice("错×");
    }

    public GetContent(): boolean {
        let el = <HTMLInputElement>this.el.querySelector("label > input");
        if (el.value == "true") {
            return true;
        }
        return false;
    }

    public GetOption(): string {
        return "";
    }
}
class cxFillOption extends cxOption {

    public Fill(content: string): void {
        let el = <HTMLInputElement>this.el.querySelector("input.inp");
        el.value = content;
        this.notice.AddNotice(this.GetOption() + ":" + content);
    }

    public GetContent(): string {
        return null;
    }

    public GetOption(): string {
        let el = this.el.querySelector("span.fb");
        return substrex(el.innerHTML, "第", "空");
    }
}