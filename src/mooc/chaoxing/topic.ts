import { TaskFactory, Task } from "./task";
import { CssBtn } from "./utils";
import { createBtn } from "@App/internal/utils/utils";
import { Application } from "@App/internal/application";
import {
    ToolsQuestionBank,
    ToolsQuestionBankFacade,
    SwitchTopicType,
    Question,
    QuestionBankFacade
} from "@App/internal/app/question";
import { CxQuestionFactory } from "./question";
import { Topic, QueryQuestions } from "@App/internal/app/topic";

export class HomeworkTopicFactory implements TaskFactory {
    protected task: TopicAdapter;

    protected createQuestion(el: HTMLElement): Question {
        return CxQuestionFactory.CreateHomeWorkQuestion(el);
    }

    public CreateTask(context: any, taskinfo: any): Task {
        let topic = new HomeworkTopic(context, new ToolsQuestionBankFacade(new ToolsQuestionBank("cx", taskinfo)));
        topic.SetQueryQuestions(new CourseQueryQuestion(context, this.createQuestion));
        this.task = new TopicAdapter(context, taskinfo, topic);

        let btn = CssBtn(createBtn("搜索答案", "搜索题目答案"));
        if ((<HTMLInputElement>document.querySelector("input#workRelationId"))) {
            document.querySelector(".CyTop").append(btn);
            btn.onclick = async () => {
                btn.innerText = "答案搜索中...";
                this.task.Start().then((ret: any) => {
                    ret = ret || "搜索题目";
                    btn.innerText = ret;
                });
            };
        }
        return this.task;
    }
}

export class ExamTopicFactory implements TaskFactory {
    protected task: TopicAdapter;

    protected createQuestion(el: HTMLElement): Question {
        return CxQuestionFactory.CreateExamCollectQuestion(el);
    }

    public CreateTask(context: any, taskinfo: any): Task {
        let topic = new ExamTopic(context, new ToolsQuestionBankFacade(new ToolsQuestionBank("cx", taskinfo)));
        this.task = new TopicAdapter(context, taskinfo, topic);
        if (document.URL.indexOf("exam/test/reVersionTestStartNew") > 0) {
            topic.SetQueryQuestions(topic);
            let btn = CssBtn(createBtn("搜索答案", "搜索题目答案"));
            document.querySelector(".Cy_ulBottom.clearfix.w-buttom,.Cy_ulTk,.Cy_ulBottom.clearfix").append(btn);
            btn.onclick = () => {
                btn.innerText = "答案搜索中...";
                try {
                    this.task.Start().then((ret: any) => {
                        ret = ret || "搜索题目";
                        btn.innerText = ret;
                    });
                } catch (e) {
                }
                return false;
            };
        } else {
            topic.SetQueryQuestions(new CourseQueryQuestion(context, this.createQuestion));
        }
        return this.task;
    }
}

export class TopicFactory implements TaskFactory {
    protected taskIframe: HTMLIFrameElement;
    protected task: TopicAdapter;

    protected createQuestion(el: HTMLElement): Question {
        return CxQuestionFactory.CreateCourseQuestion(el);
    }

    public CreateTask(context: any, taskinfo: any): Task {
        this.taskIframe = (<Window>context).document.querySelector(
            "iframe[jobid='" + taskinfo.jobid + "']"
        );
        this.createActionBtn();

        let contentWindow = (<HTMLIFrameElement>this.taskIframe.contentWindow.document.querySelector("#frame_content")).contentWindow;
        taskinfo.refer = (<Window>context).document.URL;
        taskinfo.id = taskinfo.property.workid;
        let topic = new CourseTopic(contentWindow, new ToolsQuestionBankFacade(new ToolsQuestionBank("cx", taskinfo)));
        topic.SetQueryQuestions(new CourseQueryQuestion(contentWindow, this.createQuestion));
        this.task = new TopicAdapter(contentWindow, taskinfo, topic);
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

class TopicAdapter extends Task {

    protected lock: boolean;
    protected topic: Topic;

    constructor(context: any, taskinfo: any, topic: Topic) {
        super(context, taskinfo);
        this.topic = topic;
    }

    public Init(): void {
        Application.App.log.Debug("题目信息", this.taskinfo);
        this.topic.Init();
        this.loadCallback && this.loadCallback();
    }

    public Start(): Promise<any> {
        return new Promise<any>(resolve => {
            if (this.lock) {
                return resolve();
            }
            this.lock = true;
            let ret = this.topic.QueryAnswer();
            if (ret == null) {
                if (Application.App.config.auto) {
                    ret = this.topic.Submit();
                }
            }
            this.completeCallback && this.completeCallback();
            this.lock = false;
            return resolve(ret);
        });
    }
}

class CourseQueryQuestion implements QueryQuestions {
    protected context: any;
    protected createQuestion: (el: HTMLElement) => Question;

    constructor(content: any, createQuestion: (el: HTMLElement) => Question) {
        this.context = content;
        this.createQuestion = createQuestion;
    }

    public QueryQuestions(): Question[] {
        let timu = <Array<HTMLElement>>this.context.document.querySelectorAll(".TiMu");
        let ret = new Array<Question>();
        timu.forEach((val) => {
            let question = this.createQuestion(val);
            if (question == null) {
                return;
            }
            ret.push(question);
        });
        return ret;
    }
}

class CourseTopic extends Topic {

    constructor(content: any, answer: QuestionBankFacade) {
        super(content, answer);
    }

    public Init(): Promise<any> {
        return new Promise<any>(resolve => {
            let timer = this.context.setInterval(async () => {
                if (this.context.document.readyState == "complete") {
                    this.context.clearInterval(timer);
                    if (this.context.document.URL.indexOf("selectWorkQuestionYiPiYue") > 0) {
                        await this.CollectAnswer();
                    }
                    resolve();
                }
            }, 500);
        });
    }

    public Submit(): Promise<any> {
        return new Promise<any>(resolve => {
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
    }
}

class ExamTopic extends Topic implements QueryQuestions {

    public QueryQuestions(): Question[] {
        let current = document.querySelector(".current");
        let topicType = SwitchTopicType((<HTMLElement>current.parentElement.previousElementSibling).innerText);
        let question = CxQuestionFactory.CreateExamQuestion(topicType, document.querySelector(".leftContent.TiMu"));
        let ret = new Array();
        if (question == null) {
            return ret;
        }
        ret.push(question);
        return ret;
    }

    public Init(): Promise<any> {
        if (document.URL.indexOf("exam/test/reVersionPaperMarkContentNew") > 0) {
            this.CollectAnswer();
        }
        return null
    }

    public Submit(): Promise<any> {
        return new Promise(resolve => {
            resolve();
        });
    }
}

class HomeworkTopic extends CourseTopic {

    constructor(content: any, answer: QuestionBankFacade) {
        super(content, answer);
    }

    public Init(): Promise<any> {
        return new Promise<any>(resolve => {
            if (!(<HTMLInputElement>document.querySelector("input#workRelationId"))) {
                this.CollectAnswer();
            }
            resolve();
        });
    }

    public Submit(): Promise<any> {
        return new Promise(resolve => {
            resolve();
        });
    }
}
