import { HttpUtils, removeHTML, randNumber } from "./utils";
import { Application } from "../application";
import { SystemConfig } from "@App/config";

export interface Option {
    Fill(content: string | boolean): void
    GetContent(): string | boolean
    GetOption(): string
}

// 1-单选 2-多选 3-判断 4-填空
export type TopicType = 1 | 2 | 3 | 4;
export type FillType = 1;
// 1随机答案 2不支持的随机答案类型 3无答案 4无符合答案
export type TopicStatus = "ok" | "random" | "no_support_random" | "no_answer" | "no_match";
export interface Question {
    GetTopic(): string
    GetType(): TopicType
    GetOption(): Array<Option>
    SetStatus(status: TopicStatus): void
}

let statusMap = new Map<TopicStatus, string>();
statusMap.set("ok", "答案如下:").set("random", "随机答案").set("no_support_random", "不支持的随机答案类型").
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

export type QuestionStatus = "success" | "network" | "incomplete";
export type QuestionCallback = (status: QuestionStatus) => void
export interface QuestionBank {
    AddTopic(topic: Question): void;
    Answer(callback: QuestionCallback): void;
    Push(callback: QuestionCallback): void;
}

// 小工具题库
export class ToolsQuestionBank implements QuestionBank {

    protected topic: Array<Question>
    protected platform: string
    protected info: string

    constructor(platform: string, info?: string) {
        this.topic = new Array();
        this.platform = platform;
        this.info = info;
    }

    public AddTopic(topic: Question) {
        this.topic.push(topic);
    }

    public Answer(callback: QuestionCallback) {
        let retStatus: QuestionStatus = "success";
        let next = (i: number) => {
            let info = "";
            let body = "";
            if (this.info) {
                info = "&id=" + this.info;
            }
            let t = i;
            for (; t < i + 5 && t < this.topic.length; t++) {
                let val = this.topic[t];
                body += "topic[" + (t - i) + "]=" + encodeURIComponent(removeHTML(val.GetTopic())) + "&type[" + (t - i) + "]=" + val.GetType() + "&";
            }
            HttpUtils.HttpPost(SystemConfig.url + "v2/answer?platform=" + this.platform + info, body, {
                json: true,
                success: (result: any) => {
                    let status = this.fillAnswer(i, result);
                    if (status != "success") {
                        retStatus = status;
                    }
                    if (t < this.topic.length) {
                        next(t);
                    } else {
                        callback(retStatus);
                    }
                },
                error: () => {
                    callback("network");
                }
            });
        }
        next(0);
    }

    public Push(callback: QuestionCallback): void {
        let info = "";
        if (this.info) {
            info = "&id=" + this.info;
        }
        
        HttpUtils.HttpPost(SystemConfig.url + "answer?platform=" + this.platform + info, "", {

        })
    }

    protected fillAnswer(start: number, result: Array<any>): QuestionStatus {
        let status: QuestionStatus = "success";
        for (let i = 0; i < result.length; i++) {
            let res = result[i];
            let topic = this.topic[start + i];
            let options = topic.GetOption();
            if (res.result.length <= 0) {
                //随机答案
                if (!Application.App.config.rand_answer) {
                    if (topic.GetType() == 4) {
                        topic.SetStatus("no_support_random");
                        status = "incomplete";
                        continue;
                    }
                    let index = randNumber(0, options.length - 1);
                    Application.App.log.Debug(options, topic, index);
                    topic.SetStatus("random");
                    options[index].Fill(options[index].GetContent());
                    continue;
                }
                topic.SetStatus("no_answer");
                continue;
            }
            let correct = res.result[0].correct;
            let flag = true;
            for (let i = 0; i < correct.length; i++) {
                for (let n = 0; n < options.length; n++) {
                    let content = options[n].GetContent();
                    if (content == null) {
                        //填空之类
                        if (options[n].GetOption() == correct[i].option) {
                            options[n].Fill(correct[i].content);
                            flag = false;
                        } else {
                            break;
                        }
                    } else if (typeof content == "boolean") {
                        //判断之类
                        let n = 0;
                        if (correct[i].content == false) {
                            n = 1;
                        }
                        options[n].Fill(options[n].GetContent());
                    } else if (removeHTML(content) == removeHTML(correct[i].content)) {
                        //选择之类
                        options[n].Fill(correct[i].content);
                    } else {
                        continue;
                    }
                    options.splice(n, 1);
                    flag = false;
                    break;
                }
            }
            if (flag) {
                status = "incomplete";
                topic.SetStatus("no_match");
            }
        }
        return status;
    }

}
