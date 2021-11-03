import {CssBtn} from "./utils";
import {createBtn} from "@App/internal/utils/utils";
import {Application} from "@App/internal/application";
import {
    SwitchTopicType,
    Question,
    QuestionBankFacade, QuestionStatus, QuestionStatusString
} from "@App/internal/app/question";
import {CxQuestionFactory} from "./question";
import {Topic, QueryQuestions} from "@App/internal/app/topic";
import {CxTaskControlBar, CxTask} from "@App/mooc/chaoxing/task";
import {TaskType} from "@App/internal/app/task";

export class CxTopicControlBar extends CxTaskControlBar {
    public defaultBtn() {
        super.defaultBtn();
        let topic = CssBtn(createBtn("搜索题目", "点击搜索题目答案", "cx-btn"));
        topic.style.background = "#3fae93";
        this.prev.append(topic);
        // 绑定事件
        topic.onclick = async () => {
            topic.innerText = "答案搜索中...";
            (<TopicAdapter>this.task).Start().then((ret: any) => {
                ret = ret || "搜索题目";
                topic.innerText = QuestionStatusString(ret);
            });
        };
    }
}

export class TopicAdapter extends CxTask {

    protected lock: boolean;
    protected topic: Topic;
    protected status: QuestionStatus;

    constructor(context: any, taskinfo: any, topic: Topic) {
        super(context, taskinfo);
        this.topic = topic;
    }

    public Init(): Promise<any> {
        return new Promise<any>(async resolve => {
            Application.App.log.Debug("题目信息", this.taskinfo);
            await this.topic.Init();
            resolve(undefined);
        });
    }

    public Start(): Promise<QuestionStatus> {
        return new Promise<QuestionStatus>(async resolve => {
            if (this.lock) {
                return resolve("processing");
            }
            this.lock = true;
            let ret = await this.topic.QueryAnswer();
            this.status = ret;
            this.callEvent("complete");
            this.lock = false;
            return resolve(ret);
        });
    }

    public Type(): TaskType {
        return "topic";
    }

    public async Submit(): Promise<void> {
        return new Promise((resolve) => {
            if (this.status == "success") {
                this.topic.Submit().then(() => {
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }

}

export class CxCourseQueryQuestion implements QueryQuestions {
    protected context: any;
    protected createQuestion: (context: any, el: HTMLElement) => Question;

    constructor(content: any, createQuestion: (context: any, el: HTMLElement) => Question) {
        this.context = content;
        this.createQuestion = createQuestion;
    }

    public QueryQuestions(): Question[] {
        let timu = <Array<HTMLElement>>this.context.document.querySelectorAll(".TiMu");
        let ret = new Array<Question>();
        timu.forEach((val) => {
            let question = this.createQuestion(this.context, val);
            if (question == null) {
                return;
            }
            ret.push(question);
        });
        return ret;
    }
}

export class CxCourseTopic extends Topic {

    constructor(content: any, answer: QuestionBankFacade) {
        super(content, answer);
        answer.CheckCourse();
    }

    public Init(): Promise<any> {
        return new Promise<any>(resolve => {
            let timer = this.context.setInterval(async () => {
                if (this.context.document.readyState == "complete") {
                    this.context.clearInterval(timer);
                    if (this.context.document.URL.indexOf("selectWorkQuestionYiPiYue") > 0) {
                        await this.CollectAnswer();
                    }
                    resolve(undefined);
                }
            }, 500);
        });
    }

    public QueryAnswer(): Promise<QuestionStatus> {
        if (this.context.document.URL.indexOf("selectWorkQuestionYiPiYue") > 0) {
            return null;
        }
        return super.QueryAnswer();
    }

    public Submit(): Promise<any> {
        return new Promise<any>(resolve => {
            Application.App.log.Info("准备提交答案");
            let self = this;
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
                        (<Window>this.context).parent.document.querySelector("#frame_content")
                            .addEventListener("load", async function () {
                                if (this.contentWindow.document.URL.indexOf('selectWorkQuestionYiPiYue') > 0) {
                                    await self.CollectAnswer();
                                    resolve(undefined);
                                }
                            });
                        //确定提交
                        let submit = this.context.document.querySelector(".bluebtn");
                        submit.click();
                    }, 2000);
                }, 2000);
            }, 2000);
        });
    }
}

export class ExamTopic extends Topic implements QueryQuestions {

    public QueryQuestions(): Question[] {
        let current = document.querySelector(".current");
        let topicType = SwitchTopicType((<HTMLElement>current.parentElement.previousElementSibling).innerText);
        let question = CxQuestionFactory.CreateExamQuestion(window, topicType, document.querySelector(".leftContent.TiMu"));
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
            resolve(undefined);
        });
    }
}

export class HomeworkTopic extends CxCourseTopic {

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
