import { substrex, randNumber as RandNumber, randNumber } from "@App/internal/utils/utils";
import { Question, TopicStatus, TopicStatusString, TopicType, SwitchTopicType, Option, Answer } from "@App/internal/utils/question";
import { CreateNoteLine } from "./utils";
import { Application } from "@App/internal/application";

export class CxQuestionFactory {
    public static CreateQuestion(el: HTMLElement): Question {
        let ret = SwitchTopicType(substrex(el.innerText, '【', '】'));
        if (ret == null) {
            this.AddNotice(el, "不支持的类型");
            return null
        }
        this.RemoveNotice(el);
        switch (ret) {
            case 1:
            case 2: {
                return new cxSelectQuestion(el);
            }
            case 3: {
                return new cxJudgeQuestion(el);
            }
            case 4: {
                return new cxFillQuestion(el);
            }
        }
        return null;
    }

    public static RemoveNotice(el: HTMLElement) {
        let tmpel = <HTMLElement>el.querySelector(".clearfix > ul,.clearfix > .Py_tk,.Zy_ulTk");
        if (tmpel == undefined) { tmpel = el; }
        tmpel.querySelectorAll(".prompt-line-answer").forEach((v) => { v.remove() });
    }

    public static AddNotice(el: HTMLElement, str: string) {
        let tmpel = <HTMLElement>el.querySelector(".clearfix > ul,.clearfix > .Py_tk,.Zy_ulTk");
        if (tmpel == undefined) { tmpel = el; }
        CreateNoteLine(str, "answer", tmpel);
    }
}

abstract class cxQuestion implements Question {

    protected el: HTMLElement;

    constructor(el: HTMLElement) {
        this.el = el;
    }

    public abstract Random(): TopicStatus;
    public abstract Correct(): Answer;
    public abstract Fill(answer: Answer): TopicStatus;

    public SetStatus(status: TopicStatus) {
        this.AddNotice(TopicStatusString(status));
    }

    public GetTopic(): string {
        let ret = this.el.querySelector(".Zy_TItle > .clearfix").innerHTML;
        return ret.substring(ret.indexOf('】') + 1);
    }

    public RemoveNotice() {
        CxQuestionFactory.RemoveNotice(this.el);
    }

    public AddNotice(str: string) {
        CxQuestionFactory.AddNotice(this.el, str);
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

    protected options(): NodeListOf<HTMLLIElement> {
        let el = <HTMLElement>this.el.querySelector(".clearfix > ul,.clearfix ul.Zy_ulBottom.clearfix");
        let list = el.querySelectorAll("li");
        return list;
    }
}

class cxSelectQuestion extends cxQuestion implements Question {

    protected getContent(el: HTMLElement): string {
        el = el.querySelector("a");
        return el.innerHTML;
    }

    protected getOption(el: HTMLElement): string {
        return el.querySelector("input").value;
    }

    protected click(el: HTMLElement, content: string) {
        (<HTMLElement>el.querySelector("label > input")).click();
        this.AddNotice(this.getOption(el) + ":" + content);
    }

    public Random(): TopicStatus {
        let options = this.options();
        let pos = RandNumber(0, options.length - 1);
        this.click(options[pos], this.getContent(options[pos]));
        return "random";
    }

    public Fill(s: Answer): TopicStatus {
        let options = this.options();
        let flag = false;
        for (let i = 0; i < s.correct.length; i++) {
            for (let j = 0; j < options.length; j++) {
                if (s.Equal(this.getContent(options[j]), s.correct[i].content)) {
                    this.click(options[j], s.correct[i].content);
                    flag = true;
                }
            }
        }
        if (flag) {
            return "ok";
        }
        return "no_match";
    }

    public Correct(): Answer {
        return null;
    }

}

class cxJudgeQuestion extends cxSelectQuestion implements Question {

    protected getContent(el: HTMLElement): string {
        let tmpel = <HTMLInputElement>el.querySelector("label > input");
        if (tmpel.value == "true") {
            return "对√";
        }
        return "错×";
    }

    protected click(el: HTMLElement) {
        (<HTMLElement>el.querySelector("label > input")).click();
        this.AddNotice(this.getContent(el));
    }

    public Random(): TopicStatus {
        let options = this.options();
        let pos = RandNumber(0, 1);
        this.click(options[pos]);
        return "random";
    }

    public Fill(answer: Answer): TopicStatus {
        let options = this.options();
        this.click(options[answer.correct[0].content ? 0 : 1]);
        return "ok";
    }

    public Correct(): Answer {
        return null;
    }
}

class cxFillQuestion extends cxQuestion implements Question {

    protected getOption(el: HTMLElement): string {
        let tmpel = el.querySelector("span.fb");
        return substrex(tmpel.innerHTML, "第", "空");
    }

    public Random(): TopicStatus {
        return "no_support_random";
    }

    public Correct(): Answer {
        return null;
    }

    public Fill(answer: Answer): TopicStatus {
        let options = this.options();
        let flag = 0;
        for (let i = 0; i < answer.correct.length; i++) {
            for (let j = 0; j < options.length; j++) {
                if (this.getOption(options[j]) == answer.correct[i].option) {
                    flag++;
                    let el = <HTMLInputElement>options[j].querySelector("input.inp");
                    el.value = answer.correct[i].content;
                    this.AddNotice(this.getOption(options[j]) + ":" + answer.correct[i].content);
                }
            }
        }
        if (flag == options.length) {
            return "ok";
        }
        return "no_match";
    }

}

// class cxFillOption extends cxOption {

//     public Fill(content: string): void {
//         let el = <HTMLInputElement>this.el.querySelector("input.inp");
//         el.value = content;
//         this.notice.AddNotice(this.GetOption() + ":" + content);
//     }

//     public GetContent(): string {
//         return null;
//     }

//     public GetOption(): string {
//         let el = this.el.querySelector("span.fb");
//         return substrex(el.innerHTML, "第", "空");
//     }
// }

