import { TaskFactory, Task } from "./task";
import { CssBtn, CreateNoteLine } from "./utils";
import { createBtn, substrex } from "@App/internal/utils/utils";
import { Application } from "@App/internal/application";
import { QuestionStatus, ToolsQuestionBank, ToolsQuestionBankFacad, QuestionBankFacade } from "@App/internal/utils/question";
import { SystemConfig } from "@App/config";
import { CxQuestionFactory } from "./question";

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
    protected answer: QuestionBankFacade;

    constructor(context: any, taskinfo: any) {
        super(context, taskinfo);
    }

    public Init(context: any, taskinfo: any) {
        super.Init(context, taskinfo);
        this.answer = new ToolsQuestionBankFacad(new ToolsQuestionBank("cx", taskinfo.property.workid));
        let self = this;
        Application.App.log.Debug("题目", this.taskinfo);
        (<Window>context).parent.document.querySelector("#frame_content").addEventListener("load", function () {
            if (this.contentWindow.document.URL.indexOf('selectWorkQuestionYiPiYue') > 0) {
                self.context = this.contentWindow;
                self.collectAnswer();
                self.completeCallback && self.completeCallback();
            }
        });
        let timer = this.context.setInterval(() => {
            if (this.context.document.readyState == "complete") {
                this.context.clearInterval(timer);
                if (context.document.URL.indexOf("selectWorkQuestionYiPiYue") > 0) {
                    this.collectAnswer();
                }
                this.loadCallback && this.loadCallback();
            }
        }, 500);
    }

    protected collectAnswer() {
        this.lock = true;
        Application.App.log.Debug("收集题目答案", this.context);
        let timu = <Array<HTMLElement>>this.context.document.querySelectorAll(".TiMu");
        timu.forEach((val) => {
            let topic = CxQuestionFactory.CreateQuestion(val);
            if (topic == null) {
                return;
            }
            this.answer.AddQuestion(topic);
        });
        this.answer.Push((status: QuestionStatus) => {

        });
    }

    public Start(): Promise<void> {
        return new Promise<any>(resolve => {
            if (this.lock) { return resolve(); }
            this.lock = true;
            Application.App.log.Info("题目搜索中...");
            let timu = <Array<HTMLElement>>this.context.document.querySelectorAll(".TiMu");
            timu.forEach((val) => {
                let topic = CxQuestionFactory.CreateQuestion(val);
                if (topic == null) {
                    return;
                }
                this.answer.AddQuestion(topic);
            });
            this.answer.Answer((status: QuestionStatus) => {
                this.lock = false;
                if (status == "network") {
                    resolve("网络错误");
                    this.completeCallback && this.completeCallback();
                    return Application.App.log.Fatal("题库无法访问,请查看:" + SystemConfig.url);
                } else if (status == "incomplete") {
                    resolve("答案不全");
                    this.completeCallback && this.completeCallback();
                    return Application.App.log.Warn("题库答案不全,请手动填写操作");
                }
                if (!Application.App.config.auto) {
                    return resolve();
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
