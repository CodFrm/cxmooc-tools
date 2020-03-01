import { TaskFactory, Task } from "./task";
import { CssBtn, CreateNoteLine } from "./utils";
import { createBtn, substrex } from "@App/internal/utils/utils";
import { Application } from "@App/internal/application";
import { Question, Option, QuestionList, TopicType, SwitchTopicType, TopicStatus, TopicStatusString } from "@App/internal/utils/question";

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
        Application.App.log.Debug("题目", this.taskinfo);
        this.completeCallback && this.completeCallback();
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
        list.Answer(() => {
            this.lock = false;
        });
    }
}

class cxTopic implements Question {

    public Fill(index: number, content?: string): void {
        this.options[index].Fill(content);
    }

    protected el: HTMLElement;
    protected options: Array<Option>;

    constructor(el: HTMLElement) {
        this.el = el;
    }
    public SetStatus(status: TopicStatus) {
        this.removeNotice();
        this.addNotice(TopicStatusString(status));
    }

    public GetTopic(): string {
        let ret = this.el.querySelector(".Zy_TItle > .clearfix").innerHTML;
        return ret.substring(ret.indexOf('】') + 1);
    }

    protected removeNotice() {
        let el = <HTMLElement>this.el.querySelector(".clearfix > ul,.clearfix > .Py_tk");
        el.querySelectorAll(".prompt-line-answer").forEach((v, i) => { v.remove() });
    }

    protected addNotice(str: string) {
        let el = <HTMLElement>this.el.querySelector(".clearfix > ul,.clearfix > .Py_tk");
        CreateNoteLine(str, "answer", el);
    }

    public GetType(): TopicType {
        let title = this.el.querySelector(".Zy_TItle.clearfix > .clearfix").innerHTML;
        let ret = SwitchTopicType(substrex(title, '【', '】'));
        this.removeNotice();
        if (ret == null) {
            this.addNotice("不支持的类型");
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
                    options.push(new cxSelectOption(val, el));
                    break;
                }
                case 3: {
                    options.push(new cxSelectOption(val, el));
                    break;
                }
                case 4: {
                    options.push(new cxFillOption(val, el));
                    break;
                }
            }
        });
        this.options = options;
        return options;
    }

}

abstract class cxOption implements Option {

    protected el: HTMLElement
    protected father: HTMLElement

    constructor(el: HTMLElement, father: HTMLElement) {
        this.el = el;
        this.father = father;
    }

    abstract Fill(content?: string): void
    abstract GetContent(): string
    abstract GetOption(): string
}

class cxSelectOption extends cxOption {

    public Fill(content?: string): void {

    }

    public GetContent(): string {
        let el = this.el.querySelector("a");
        return el.innerHTML;
    }

    public GetOption(): string {
        return this.el.querySelector("input").value;
    }
}

class cxFillOption extends cxOption {

    public Fill(content?: string): void {

    }

    public GetContent(): string {
        console.log("123")
        let el = this.el.querySelector("a");
        return el.innerHTML;
    }

    public GetOption(): string {
        return "";
    }
}