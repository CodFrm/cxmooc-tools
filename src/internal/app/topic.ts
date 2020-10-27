import {
    QuestionBankFacade,
    QuestionStatus,
    Question,
} from "./question";
import {Application} from "../application";
import {SystemConfig} from "@App/config";

// 查询任务中的题目,返回Question数组
export interface QueryQuestions {
    QueryQuestions(): Question[];
}

// 题目任务点
export abstract class Topic {
    protected lock: boolean;
    protected answer: QuestionBankFacade;
    protected context: any;
    protected queryQuestions: QueryQuestions;

    constructor(content: any, answer: QuestionBankFacade) {
        this.answer = answer;
        this.context = content;
    }

    public SetQueryQuestions(queryQuestions: QueryQuestions): void {
        this.queryQuestions = queryQuestions;
    }

    public abstract Init(): Promise<any>;

    protected addQuestion() {
        let questions = this.queryQuestions.QueryQuestions();
        this.answer.ClearQuestion();
        questions.forEach((val) => {
            this.answer.AddQuestion(val);
        });
    }

    public QueryAnswer(): Promise<QuestionStatus> {
        return new Promise<QuestionStatus>(resolve => {
            if (this.lock) {
                return resolve("processing");
            }
            this.lock = true;
            Application.App.log.Info("题目搜索中...");
            this.addQuestion();
            this.answer.Answer((status: QuestionStatus) => {
                this.lock = false;
                resolve(status);
                if (status == "network") {
                    return Application.App.log.Error("题库无法访问,请查看:" + SystemConfig.url);
                } else if (status == "incomplete") {
                    return Application.App.log.Warn("题库答案不全,请手动填写操作");
                }
            });
        });
    }

    public CollectAnswer(): Promise<any> {
        return new Promise(resolve => {
            Application.App.log.Debug("收集题目答案", this.context);
            this.addQuestion();
            this.answer.Push((status: QuestionStatus) => {
                Application.App.log.Debug("采集答案返回", status);
                resolve();
            });
        });
    }

    public abstract Submit(): Promise<any>;

}