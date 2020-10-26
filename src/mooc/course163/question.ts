import {Topic, QueryQuestions} from "@App/internal/app/topic";
import {Question, TopicType, TopicStatus, Answer, TopicStatusString} from "@App/internal/app/question";
import {CreateNoteLine} from "../chaoxing/utils";
import {randNumber, Sleep, UntrustedClick} from "@App/internal/utils/utils";
import {Application} from "@App/internal/application";

export class CourseQueryAnswer implements QueryQuestions {
    public QueryQuestions(): Question[] {
        let ret = new Array();
        let timu = document.querySelectorAll(".u-questionItem");
        timu.forEach((val: HTMLElement) => {
            ret.push(this.createQuestion(val));
        });
        return ret;
    }

    protected createQuestion(el: HTMLElement) {
        if (el.querySelector(".optionCnt span.u-icon-correct")) {
            return new JudgeQuestion(el, 3);
        } else if (el.querySelector("input[type='radio']") != null) {
            return new CourseQuestion(el, 1);
        } else if (el.querySelector("input[type='checkbox']") != null) {
            return new CourseQuestion(el, 2);
        } else if (el.querySelector("textarea") != null) {
            return new FillQuestion(el, 4);
        }
        return new CourseQuestion(el, -1);
    }
}

//TODO:优化
class CourseQuestion implements Question {
    protected el: HTMLElement;
    protected type: TopicType;

    constructor(el: HTMLElement, type: TopicType) {
        this.el = el;
        this.type = type;
        this.RemoveNotice();
    }

    public GetType(): TopicType {
        return this.type;
    }

    public GetTopic(): string {
        return this.dealImgDomain(this.el.querySelector(".f-richEditorText.j-richTxt").innerHTML);
    }

    public RemoveNotice() {
        this.el.querySelectorAll(".prompt-line-answer").forEach((v) => {
            v.remove()
        });
    }

    public AddNotice(str: string) {
        CreateNoteLine(str, "answer", this.el);
    }

    public SetStatus(status: TopicStatus): void {
        this.AddNotice(TopicStatusString(status));
    }

    protected getContent(el: HTMLElement): string {
        return el.querySelector(".f-fl.optionCnt").innerHTML;
    }

    protected getOption(el: HTMLElement): string {
        return el.querySelector(".f-fl.optionPos").innerHTML.substring(0, 1);
    }

    protected fill(el: HTMLElement, content: string) {
        if (!el.parentElement.querySelector("input").checked) {
            UntrustedClick(el.parentElement.querySelector("input"));
        }
        content = content.replace(/style=".*?"/, "");
        content = content.replace(/(<p>|<\/p>)/, "");
        this.AddNotice(this.getOption(el) + ":" + content);
    }

    public Random(): TopicStatus {
        let opts = this.options();
        let pos = randNumber(0, opts.length - 1);
        this.fill(opts[pos], this.getContent(opts[pos - 1]))
        return "random";
    }

    protected options(): NodeListOf<HTMLLIElement> {
        return this.el.querySelectorAll(".u-tbl.f-pr.f-cb");
    }

    protected dealImgDomain(content: string): string {
        //移除域名对比,也不知道还有没有花里胡哨的
        content = content.replace(/"http(s|):\/\/edu-image.nosdn.127.net\/(.*?)"/, "\"http://nos.netease.com/edu-image/$2\"");
        content = content.replace(/"http(s|):\/\/(.*?)\//g, "\"");
        return content;
    }

    public Fill(answer: Answer): Promise<TopicStatus> {
        return new Promise<TopicStatus>(async resolve => {
            let options = this.options();
            let flag = false;
            for (let i = 0; i < answer.correct.length; i++) {
                for (let n = 0; n < options.length; n++) {
                    if (answer.Equal(this.dealImgDomain(this.getContent(options[n])), this.dealImgDomain(answer.correct[i].content))) {
                        this.fill(options[n], answer.correct[i].content);
                        if (this.GetType() == 2 && i != answer.correct.length - 1) {
                            //多选
                            await Sleep(Application.App.config.topic_interval * 1000);
                        }
                        flag = true;
                    }
                }
            }
            if (flag) {
                return resolve("ok");
            }
            return resolve("no_match");
        });
    }

    public Correct(): Answer {
        return null;
    }

}

class FillQuestion extends CourseQuestion {
    public Random(): TopicStatus {
        return "no_support_random";
    }

    public Fill(answer: Answer): Promise<TopicStatus> {
        return new Promise<TopicStatus>(async resolve => {
            let el = this.el.querySelector("textarea");
            el.focus();
            let match;
            if (match = answer.correct[0].content.match(/^[\(\[]([\d\.]+),([\d\.]+)[\)\]]$/)) {
                //范围题
                el.value = ((parseFloat(match[1]) + parseFloat(match[2])) / 2).toString();
                this.AddNotice("填空 取值范围:" + answer.correct[0].content);
            } else {
                el.value = answer.correct[0].content.split("##%_YZPRLFH_%##")[0];
                this.AddNotice("填空:" + answer.correct[0].content.replace("##%_YZPRLFH_%##", " 或 "));
            }
            return resolve("ok");
        });
    }

}

class JudgeQuestion extends CourseQuestion {

    public Fill(answer: Answer): Promise<TopicStatus> {
        return new Promise<TopicStatus>(async resolve => {
            let el: HTMLElement;
            if (answer.correct[0].content) {
                el = this.el.querySelector(".u-tbl.f-pr.f-cb .u-icon-correct").parentElement.parentElement;
            } else {
                el = this.el.querySelector(".u-tbl.f-pr.f-cb .u-icon-wrong").parentElement.parentElement;
            }
            this.fill(el, this.getContent(el))
            return resolve("ok");
        });
    }

}

export class CourseTopic extends Topic {

    public Init(): Promise<any> {
        return null;
    }

    public Submit(): Promise<any> {
        return null;
    }

}