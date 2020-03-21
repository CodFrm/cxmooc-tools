import { QuestionBankFacade, ToolsQuestionBankFacade, ToolsQuestionBank, QuestionStatus, Question } from "./question";
import { Application } from "../application";
import { SystemConfig } from "@App/config";

export interface QueryQuestions {
    QueryQuestions(): Question[];
}

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

    public QueryAnswer(): Promise<any> {
        return new Promise<any>(resolve => {
            if (this.lock) {
                return resolve("搜索中...");
            }
            this.lock = true;
            Application.App.log.Info("题目搜索中...");
            let questions = this.queryQuestions.QueryQuestions();
            this.answer.ClearQuestion();
            questions.forEach((val) => {
                this.answer.AddQuestion(val);
            });
            this.answer.Answer((status: QuestionStatus) => {
                this.lock = false;
                if (status == "network") {
                    resolve("网络错误");
                    return Application.App.log.Fatal("题库无法访问,请查看:" + SystemConfig.url);
                } else if (status == "incomplete") {
                    resolve("答案不全");
                    return Application.App.log.Warn("题库答案不全,请手动填写操作");
                }
                resolve();
            });
        });
    }

    public abstract Submit(): Promise<any>;

}