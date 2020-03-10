import { TaskFactory, Task } from "./task";
import { CssBtn, CreateNoteLine } from "./utils";
import { createBtn, substrex } from "@App/internal/utils/utils";
import { Application } from "@App/internal/application";
import { Question, Option, TopicType, SwitchTopicType, TopicStatus, TopicStatusString, QuestionStatus, ToolsQuestionBank, QuestionBank } from "@App/internal/utils/question";
import { SystemConfig } from "@App/config";

export class HomeWorkTopicFactory implements TaskFactory {
    protected task: Topic;
    public CreateTask(context: any, taskinfo: any): Task {
        this.task = new Topic(context, taskinfo);
        let btn = CssBtn(createBtn("搜索答案", "搜索题目答案"));
        document.querySelector(".CyTop").append(btn);
        btn.onclick = async () => {
            btn.innerText = "答案搜索中...";
            this.task.Start().then((ret: any) => {
                ret = ret || "搜索题目";
                btn.innerText = ret;
            });
        };
        return this.task;
    }

}
export class TopicFactory implements TaskFactory {
    protected taskIframe: HTMLIFrameElement;
    protected task: Topic;
    public CreateTask(context: any, taskinfo: any): Task {
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
        topic.onclick = async () => {
            topic.innerText = "答案搜索中...";
            this.task.Start().then((ret: any) => {
                ret = ret || "搜索题目";
                topic.innerText = ret;
            });
        };
    }
}

export class Topic extends Task {

    protected lock: boolean;

    public Init(context: any, taskinfo: any) {
        let self = this;
        super.Init(context, taskinfo);
        Application.App.log.Debug("题目", this.taskinfo);
        (<Window>context).parent.document.querySelector("#frame_content").addEventListener("load", function () {
            if (this.contentWindow.document.URL.indexOf('selectWorkQuestionYiPiYue') > 0) {
                self.context = this.contentWindow;
                self.collectAnswer();
                this.completeCallback && this.completeCallback();
            }
        });
        if (context.document.URL.indexOf("selectWorkQuestionYiPiYue") > 0) {
            this.collectAnswer();
            this.loadCallback && this.loadCallback();
        } else {
            let timer = this.context.setInterval(() => {
                if (this.context.document.readyState == "complete") {
                    clearInterval(timer);
                    this.loadCallback && this.loadCallback();
                }
            }, 500);
        }
    }

    protected collectAnswer() {
        this.lock = true;
        Application.App.log.Debug("收集题目答案", this.context);
        let timu = <Array<HTMLElement>>this.context.document.querySelectorAll(".TiMu");
        let list: QuestionBank = new ToolsQuestionBank("cx", this.taskinfo.property.workid);
        timu.forEach((val) => {
            let topic = new cxTopic(val);
            if (topic.GetType() == null) {
                return;
            }
            list.AddTopic(topic);
        });
        list.Push(() => {
            
        });
    }


    public Start(): Promise<void> {
        return new Promise<any>(resolve => {
            if (this.lock) { return resolve(); }
            this.lock = true;
            Application.App.log.Info("题目搜索中...");
            let timu = <Array<HTMLElement>>this.context.document.querySelectorAll(".TiMu");
            let list: QuestionBank = new ToolsQuestionBank("cx", this.taskinfo.property.workid);
            timu.forEach((val) => {
                let topic = new cxTopic(val);
                if (topic.GetType() == null) {
                    return;
                }
                list.AddTopic(topic);
            });
            list.Answer((status: QuestionStatus) => {
                this.lock = false;
                if (status == "network") {
                    resolve("网络错误");
                    return Application.App.log.Fatal("题库无法访问,请查看:" + SystemConfig.url);
                } else if (status == "incomplete") {
                    resolve("答案不全");
                    Application.App.log.Warn("题库答案不全,请手动填写操作");
                    return this.completeCallback && this.completeCallback();
                }
                if (!Application.App.config.auto) {
                    resolve();
                    return this.completeCallback && this.completeCallback();
                }
                Application.App.log.Info("准备提交答案");
                this.context.setTimeout(() => {
                    let submit = this.context.document.querySelector(".Btn_blue_1");
                    submit.click();
                    this.context.setTimeout(() => {
                        let prompt = this.context.document.querySelector("#tipContent").innerHTML;
                        if (prompt.indexOf("未做完") > 0) {
                            alert("提示:" + prompt);
                            resolve("未做完");
                            Application.App.log.Fatal("有题目未完成,请手动操作.提示:" + prompt);
                            return;
                        }
                        let timer = this.context.setInterval(() => {
                            prompt = document.getElementById("validate");
                            if (prompt.style.display != 'none') {
                                //等待验证码接管
                                return;
                            }
                            this.context.clearInterval(timer);
                            //确定提交
                            let submit = this.context.document.querySelector(".bluebtn");
                            submit.click();

                            resolve();
                        }, 2000);
                    }, 2000);
                }, 2000);
            });
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
        let el = <HTMLElement>this.el.querySelector(".clearfix > ul,.clearfix > .Py_tk,.Zy_ulTk");
        if (el == undefined) { el = this.el }
        el.querySelectorAll(".prompt-line-answer").forEach((v) => { v.remove() });
    }

    public AddNotice(str: string) {
        let el = <HTMLElement>this.el.querySelector(".clearfix > ul,.clearfix > .Py_tk,.Zy_ulTk");
        if (el == undefined) { el = this.el }
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
        list.forEach((val) => {
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