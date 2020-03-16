import { HttpUtils, removeHTML, randNumber } from "./utils";
import { SystemConfig } from "@App/config";
import { Application } from "../application";

export interface Topic {
    topic: string
    type: TopicType
    id?: string
}

export interface Option {
    option: any
    content: any
}

export interface Answer {
    index: number
    topic: string
    type: TopicType
    status: TopicStatus
    answer?: Option[]
    correct: Option[]

    Equal(content1: string, content2: string): boolean
}

export interface Question {
    GetType(): TopicType;
    GetTopic(): string;
    Random(): TopicStatus;
    Fill(s: Answer): TopicStatus;
    Correct(): Answer
    SetStatus(status: TopicStatus): void;
}

//-1-一个错误 1-单选 2-多选 3-判断 4-填空
export type TopicType = -1 | 1 | 2 | 3 | 4;
export type FillType = 1;
// 1随机答案 2不支持的随机答案类型 3无答案 4无符合答案
export type TopicStatus = "ok" | "random" | "no_support_random" | "no_answer" | "no_match";

let statusMap = new Map<TopicStatus, string>();
statusMap.set("ok", "搜索成功").set("random", "随机答案").set("no_support_random", "不支持的随机答案类型").
    set("no_answer", "题库中没有搜索到答案").set("no_match", "题库中没有符合的答案");
export function TopicStatusString(status: TopicStatus): string {
    return statusMap.get(status);
}

export function SwitchTopicType(title: string): TopicType {
    switch (title) {
        case "单选题": {
            return 1;
        }
        case "多选题": {
            return 2;
        }
        case "判断题": {
            return 3;
        }
        case "填空题": {
            return 4;
        }
        default: {
            return null;
        }
    }
}

export type QuestionStatus = "success" | "network" | "incomplete" | "processing";
export type QuestionCallback = (status: QuestionStatus) => void
export interface QuestionBank {
    Answer(topic: Topic[]): Promise<{ status: QuestionStatus, answer: Answer[] }>;
    Push(answer: Answer[]): Promise<QuestionStatus>;
}

// 小工具题库
export class ToolsQuestionBank implements QuestionBank {

    protected platform: string
    protected info: string

    constructor(platform: string, info?: string) {
        this.platform = platform;
        this.info = info;
    }

    public Answer(topic: Topic[]): Promise<{ status: QuestionStatus, answer: Answer[] }> {
        let num = 5;
        return new Promise((resolve) => {
            let answer = new Array<Answer>();
            let retStatus: QuestionStatus = "success";
            let next = (index: number) => {
                let info = "";
                let body = "";
                if (this.info) {
                    info = "&id=" + this.info;
                }
                let t = index;
                for (; t < index + num && t < topic.length; t++) {
                    let val = topic[t];
                    body += "topic[" + (t - index) + "]=" + encodeURIComponent(removeHTML(val.topic)) + "&type[" + (t - index) + "]=" + val.type + "&";
                }
                HttpUtils.HttpPost(SystemConfig.url + "v2/answer?platform=" + this.platform + info, body, {
                    json: true,
                    success: (result: any) => {
                        let status: QuestionStatus = "success";
                        let tmpResult = new Array<Answer>();
                        for (let i = 0; i < result.length; i++) {
                            if (result[index + i].result == undefined || result[index + i].result.length <= 0) {
                                tmpResult.push({
                                    index: index + result[i].index,
                                    topic: result[i].topic,
                                    type: -1,
                                    status: "no_answer",
                                    answer: null,
                                    correct: null,
                                    Equal: this.Equal,
                                });
                                status = "incomplete";
                                continue;
                            }
                            let val = result[i].result[0];
                            tmpResult.push({
                                index: index + result[i].index,
                                topic: val.topic,
                                type: val.type,
                                correct: val.correct,
                                status: "ok",
                                Equal: this.Equal,
                            });
                        }
                        answer = answer.concat(tmpResult);
                        if (status != "success") {
                            retStatus = status;
                        }
                        resolve({ status: "processing", answer: tmpResult });
                        if (t < topic.length) {
                            next(t);
                        } else {
                            return resolve({ status: retStatus, answer: answer });
                        }
                    },
                    error: () => {
                        return resolve({ status: "network", answer: answer });
                    }
                });
            }
            next(0);
        });
    }

    public Push(answer: Answer[]): Promise<QuestionStatus> {
        return new Promise((resolve) => {
            let info = "";
            if (this.info) {
                info = "&id=" + this.info;
            }
            HttpUtils.HttpPost(SystemConfig.url + "answer?platform=" + this.platform + info, JSON.stringify(answer), {
                json: true,
                success: (result: any) => {
                    Application.App.log.Info("答案自动记录成功,成功获得" + result.add_token_num + "个打码数,剩余数量:" + result.token_num);
                    resolve("success");
                },
                error: () => {
                    resolve("network");
                }
            })
        });
    }

    public Equal(content1: string, content2: string): boolean {
        return removeHTML(content1) == removeHTML(content2);
    }
}
export interface AnswerProxy {
    ClearQuestion(): void
    AddQuestion(q: Question): void
    Answer(callback: (status: QuestionStatus) => void): void
    Push(callback: (status: QuestionStatus) => void): void
}
export class ToolsAnswerProxy implements AnswerProxy {
    protected bank: QuestionBank;
    protected question: Array<Question>;

    constructor(bank: QuestionBank) {
        this.bank = bank;
        this.question = new Array<Question>();
    }

    public ClearQuestion() {
        this.question = new Array<Question>();
    }

    public AddQuestion(q: Question) {
        this.question.push(q);
    }

    public Answer(callback: (status: QuestionStatus) => void) {
        let topic = new Array<Topic>();
        this.question.forEach((val) => {
            topic.push({
                topic: val.GetTopic(),
                type: val.GetType(),
            });
        });
        this.bank.Answer(topic).then((ret: { status: QuestionStatus, answer: Answer[] }) => {
            if (ret.status != "processing") {
                return callback(ret.status);
            }
            for (let i = 0; i < ret.answer.length; i++) {
                let answer = ret.answer[i];
                let question = this.question[answer.index];
                let tmpStatus = answer.status;
                if (answer.status == "no_answer") {
                    if (Application.App.config.rand_answer) {
                        tmpStatus = question.Random();
                    }
                    question.SetStatus(tmpStatus);
                    continue;
                }
                if (answer.type != question.GetType()) {
                    tmpStatus = "no_match";
                } else {
                    tmpStatus = question.Fill(answer);
                }
                if (tmpStatus == "no_match" && Application.App.config.rand_answer) {
                    question.SetStatus(question.Random());
                    continue;
                }
                question.SetStatus(tmpStatus);
            }
            return callback(ret.status);
        });
    }

    public Push(callback: (status: QuestionStatus) => void): void {
        let answer = new Array<Answer>();
        this.question.forEach((val) => {
            let correct = val.Correct();
            if (correct == null || correct.correct == null) {
                return;
            }
            answer.push(correct);
        });
        this.bank.Push(answer).then((ret: QuestionStatus) => {
            return callback(ret);
        });
    }
}