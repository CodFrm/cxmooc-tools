import {HttpUtils, removeHTML, randNumber, Sleep} from "../utils/utils";
import {SystemConfig} from "@App/config";
import {Application} from "../application";

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
    answers?: Option[]
    correct: Option[]
    errors?: Option[]
    id?: string

    Equal(content1: string, content2: string): boolean
}

export class PushAnswer implements Answer {
    public index: number;
    public topic: string;
    public type: TopicType;
    public status: TopicStatus;
    public answers: Option[];
    public errors: Option[];
    public correct: Option[];

    public Equal(content1: string, content2: string): boolean {
        return content1 == content2;
    }
}

// 选项
export interface Options {
    Random(): TopicStatus;

    Fill(s: Answer): Promise<TopicStatus>;

    Correct(): Answer
}

// 题目,继承了选项接口
export interface Question extends Options {
    GetType(): TopicType;

    GetTopic(): string;

    SetStatus(status: TopicStatus): void;
}

//-1-一个错误 1-单选 2-多选 3-判断 4-填空
export type TopicType = -1 | 1 | 2 | 3 | 4;
export type FillType = 1;
// 1随机答案 2不支持的随机答案类型 3无答案 4无符合答案
export type TopicStatus = "ok" | "random" | "no_support_random" | "no_answer" | "no_match";

let topicStatusMap = new Map<TopicStatus, string>();
topicStatusMap.set("ok", "搜索成功").set("random", "随机答案").set("no_support_random", "不支持的随机答案类型").set("no_answer", "题库中没有搜索到答案").set("no_match", "题库中没有符合的答案");
let questionStatusMap = new Map<QuestionStatus, string>();
questionStatusMap.set("success", "搜索成功").set("network", "题库网络错误").set("incomplete", "题库不全").set("processing", "搜索中...");

export function TopicStatusString(status: TopicStatus): string {
    return topicStatusMap.get(status) || "未知错误";
}

export function QuestionStatusString(status: QuestionStatus): string {
    return questionStatusMap.get(status) || "未知错误";
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

export type QuestionBankCallback = (args: { status: QuestionStatus, answer: Answer[] }) => Promise<void>

// 题库具体实现
export interface QuestionBank {
    Answer(topic: Topic[], resolve: QuestionBankCallback): void;

    Push(answer: Answer[]): Promise<QuestionStatus>;

    SetInfo(info: QuestionInfo): void;

    CheckCourse?(info?: QuestionInfo[]): Promise<number>;
}

export interface QuestionInfo {
    refer: string
    id: string
}

// 小工具题库
export class ToolsQuestionBank implements QuestionBank {

    protected platform: string;
    protected info: QuestionInfo;

    constructor(platform: string, info?: QuestionInfo) {
        this.platform = platform;
        this.info = info;
    }

    public SetInfo(info: QuestionInfo): void {
        this.info = info;
    }

    public GetInfo(): string {
        return encodeURIComponent(JSON.stringify(this.info));
    }

    public Answer(topic: Topic[], resolve: QuestionBankCallback): void {
        Application.App.log.Debug("答案查询", topic);
        let num = 20;
        let answer = new Array<Answer>();
        let retStatus: QuestionStatus = "success";
        let next = (index: number) => {
            let body = "info=" + this.GetInfo() + "&";
            let t = index;
            for (; t < index + num && t < topic.length; t++) {
                let val = topic[t];
                body += "topic[" + (t - index) + "]=" + encodeURIComponent((val.topic)) + "&type[" + (t - index) + "]=" + val.type + "&";
            }
            HttpUtils.HttpPost(SystemConfig.url + "v2/answer?platform=" + this.platform, body, {
                headers: {
                    "Authorization": Application.App.config.vtoken,
                    "X-Version": SystemConfig.version.toString(),
                },
                json: true,
                success: async (result: any) => {
                    let status: QuestionStatus = "success";
                    let tmpResult = new Array<Answer>();
                    for (let i = 0; i < result.length; i++) {
                        if (result[i].result == undefined || result[i].result.length <= 0) {
                            tmpResult.push({
                                index: index + result[i].index,
                                topic: result[i].topic,
                                type: -1,
                                status: "no_answer",
                                answers: null,
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
                    await resolve({status: "processing", answer: tmpResult});
                    if (t < topic.length) {
                        next(t);
                    } else {
                        return resolve({status: retStatus, answer: answer});
                    }
                },
                error: () => {
                    return resolve({status: "network", answer: answer});
                }
            });
        }
        next(0);
    }

    public Push(answer: Answer[]): Promise<QuestionStatus> {
        return new Promise((resolve) => {
            Application.App.log.Debug("采集提交", answer);
            HttpUtils.HttpPost(SystemConfig.url + "answer?platform=" + this.platform, "info=" + this.GetInfo() + "&data=" + encodeURIComponent(JSON.stringify(answer)), {
                headers: {
                    "Authorization": Application.App.config.vtoken,
                    "X-Version": SystemConfig.version.toString(),
                },
                json: true,
                success: (result: any) => {
                    Application.App.log.Info("答案自动记录成功,成功获得" + result.add_token_num + "个打码数,剩余数量:" + result.token_num);
                    resolve("success");
                },
                error: () => {
                    resolve("network");
                }
            });
        });
    }

    public Equal(content1: string, content2: string): boolean {
        return removeHTML(content1) == removeHTML(content2);
    }

    public CheckCourse(info?: QuestionInfo[]): Promise<number> {
        return new Promise<number>(resolve => {
            info = info || [this.info];
            HttpUtils.HttpPost(SystemConfig.url + "v2/check?platform=" + this.platform, "info=" + encodeURIComponent(JSON.stringify(info)), {
                headers: {
                    "Authorization": Application.App.config.vtoken,
                    "X-Version": SystemConfig.version.toString(),
                },
                success: () => {
                    resolve(0);
                }, error: () => {
                    resolve(-1);
                }
            });
            resolve();
        });
    }
}

export interface QuestionBankFacade {
    ClearQuestion(): void

    AddQuestion(q: Question): void

    Answer(callback: (status: QuestionStatus) => void): void

    Push(callback: (status: QuestionStatus) => void): void

    CheckCourse(): Promise<number>
}

export class ToolsQuestionBankFacade implements QuestionBankFacade {
    protected bank: QuestionBank;
    protected question: Array<Question>;

    constructor(platform?: string | QuestionBank, info?: any) {
        if (typeof platform == "string") {
            this.bank = new ToolsQuestionBank(platform, info);
        } else {
            this.bank = platform;
        }
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
            let type = val.GetType();
            if (type == -1) {
                return;
            }
            topic.push({
                topic: (val.GetTopic()),
                type: type,
            });
        });
        let status: QuestionStatus = "success";
        this.bank.Answer(topic, (ret: { status: QuestionStatus, answer: Answer[] }): Promise<void> => {
            return new Promise(async (resolve) => {
                if (ret.status != "processing") {
                    Application.App.log.Debug("题库返回", ret);
                    if (ret.status != "success" || status == "success") {
                        callback(ret.status);
                        return resolve();
                    }
                    callback(status);
                    return resolve();
                }
                let t = Application.App.config.topic_interval * 1000;
                for (let i = 0; i < ret.answer.length; i++) {
                    let answer = ret.answer[i];
                    let question = this.question[answer.index];
                    let tmpStatus = answer.status;
                    if (answer.status == "no_answer") {
                        status = this.randAnswer(status, tmpStatus, question);
                        await Sleep(t);
                        continue
                    }
                    if (answer.type != question.GetType()) {
                        tmpStatus = "no_match";
                    } else {
                        tmpStatus = await question.Fill(answer);
                    }
                    if (tmpStatus == "no_match") {
                        status = this.randAnswer(status, tmpStatus, question);
                        await Sleep(t);
                        continue
                    }
                    question.SetStatus(tmpStatus);
                    if (i < ret.answer.length - 1) {
                        await Sleep(t);
                    }
                }
                return resolve();
            });
        });
    }

    protected randAnswer(status: QuestionStatus, tmpStatus: TopicStatus, question: Question): QuestionStatus {
        if (Application.App.config.rand_answer) {
            tmpStatus = question.Random();
        } else {
            status = "incomplete";
        }
        if (tmpStatus == "no_support_random") {
            status = "incomplete";
        }
        question.SetStatus(tmpStatus);
        return status;
    }

    public Push(callback: (status: QuestionStatus) => void): void {
        let answer = new Array<Answer>();
        this.question.forEach((val) => {
            let correct = val.Correct();
            if (correct == null || correct.correct == null || correct.type == -1) {
                return;
            }
            answer.push(correct);
        });
        this.bank.Push(answer).then((ret: QuestionStatus) => {
            Application.App.log.Debug("题库返回", ret);
            return callback(ret);
        });
    }

    protected dealOption(options: Option[]): Option[] {
        for (let i = 0; i < options.length; i++) {
            if (typeof options[i].content == "string") {
                options[i].content = (options[i].content);
            }
        }
        return options;
    }

    public CheckCourse(): Promise<number> {
        return this.bank.CheckCourse();
    }

}
