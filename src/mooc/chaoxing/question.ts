import { substrex, randNumber as RandNumber, randNumber } from "@App/internal/utils/utils";
import {
    Question,
    TopicStatus,
    TopicStatusString,
    TopicType,
    SwitchTopicType,
    Answer,
    PushAnswer,
    Options
} from "@App/internal/app/question";
import { CreateNoteLine } from "./utils";

export class CxQuestionFactory {

    public static CreateQuestion(el: HTMLElement): Question {
        let ret = SwitchTopicType(substrex(el.innerText, '【', '】'));
        if (ret == null) {
            this.AddNotice(el, "不支持的类型");
            return null
        }
        this.RemoveNotice(el);
        return this.CreateCourseQuestion(ret, el);
    }

    public static CreateExamTopic(type: TopicType, el: HTMLElement): Question {
        return this.CreateCourseQuestion(type, el);
    }

    public static CreateCourseQuestion(type: TopicType, el: HTMLElement): Question {
        let ret: Question = null;
        switch (type) {
            case 1:
            case 2: {
                ret = new cxSelectQuestion(el, type);
            }
            case 3: {
                ret = new cxJudgeQuestion(el, type);
            }
            case 4: {
                ret = new cxFillQuestion(el, type);
            }
        }
        return ret;
    }

    public static CreateExamQuestion(type: TopicType, el: HTMLElement): Question {
        let ret: Question = null;
        switch (type) {
            case 1:
            case 2: {
                ret = new cxExamSelectQuestion(el, type);
            }
            case 3: {
                ret = new cxExamJudgeQuestion(el, type);
            }
            case 4: {
                ret = new cxExamFillQuestion(el, type);
            }
        }
        return ret;
    }

    protected static getBeforeType(el: HTMLElement): TopicType {
        let before = el.previousElementSibling;
        do {
            if (before.className == "Cy_TItle1") {
                return SwitchTopicType(substrex((<HTMLElement>before).innerText, ".", "（"));
            }
            before = before.previousElementSibling;
        } while (before != null)
        return null;
    }

    public static CreateHomeWorkQuestion(el: HTMLElement): Question {
        let ret = CxQuestionFactory.getBeforeType(el);
        if (ret == null) {
            this.AddNotice(el, "不支持的类型");
            return null
        }
        this.RemoveNotice(el);
        return this.CreateCourseQuestion(ret, el);
    }

    public static RemoveNotice(el: HTMLElement) {
        let tmpel = <HTMLElement>el.querySelector(".clearfix > ul,.clearfix > .Py_tk,.Zy_ulTk");
        if (tmpel == undefined) {
            tmpel = el;
        }
        tmpel.querySelectorAll(".prompt-line-answer").forEach((v) => {
            v.remove()
        });
    }

    public static AddNotice(el: HTMLElement, str: string) {
        let tmpel = <HTMLElement>el.querySelector(".clearfix > ul,.clearfix > .Py_tk,.Zy_ulTk");
        if (tmpel == undefined) {
            tmpel = el;
        }
        CreateNoteLine(str, "answer", tmpel);
    }
}

abstract class cxCourseQuestion implements Question {

    protected el: HTMLElement;
    protected type: TopicType;

    constructor(el: HTMLElement, type: TopicType) {
        this.el = el;
        this.type = type;
    }

    public abstract Random(): TopicStatus;

    public abstract Correct(): Answer;

    public abstract Fill(answer: Answer): TopicStatus;

    public SetStatus(status: TopicStatus) {
        this.AddNotice(TopicStatusString(status));
    }

    public GetTopic(): string {
        let ret = this.el.querySelector(".Zy_TItle > .clearfix").innerHTML;
        ret = ret.substring(ret.indexOf('】') + 1);
        if (/（(.+?)分）$/.test(ret)) {
            ret = ret.substring(0, ret.lastIndexOf("（"));
        }
        return ret;
    }

    public RemoveNotice() {
        CxQuestionFactory.RemoveNotice(this.el);
    }

    public AddNotice(str: string) {
        CxQuestionFactory.AddNotice(this.el, str);
    }

    public GetType(): TopicType {
        return this.type;
    }

    protected options(): NodeListOf<HTMLLIElement> {
        let el = <HTMLElement>this.el.querySelector(".clearfix > ul,.clearfix ul.Zy_ulBottom.clearfix");
        let list = el.querySelectorAll("li");
        return list;
    }

    protected isCorrect(): Element {
        let el = this.el.querySelector(".Py_answer.clearfix");
        if (el.innerHTML.indexOf('正确答案') < 0) {
            if (el.querySelectorAll('.fr.dui').length <= 0 && el.querySelectorAll('.fr.bandui').length <= 0) {
                return null;
            }
        }
        return el;
    }

    protected defaultAnswer(): Answer {
        let ret = new PushAnswer();
        ret.topic = this.GetTopic();
        ret.type = this.GetType();
        ret.correct = new Array();
        ret.answer = new Array();
        return ret;
    }
}

class cxSelectQuestion extends cxCourseQuestion implements Options {

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
        let correct = this.isCorrect();
        if (correct == null) {
            return null;
        }
        let ret = this.defaultAnswer();
        let options = this.el.querySelectorAll(".Zy_ulTop > li.clearfix");
        let correctText = correct.querySelector("span").innerText;
        for (let i = 0; i < options.length; i++) {
            let optionText = (<HTMLElement>options[i].querySelector("i.fl")).innerText;
            let option = {
                option: optionText.substring(0, 1),
                content: options[i].querySelector("a.fl").innerHTML,
            };
            ret.answer.push(option);
            if (correctText.indexOf(option.option) > 0) {
                ret.correct.push(option);
            }
        }
        return ret;
    }

}

class cxJudgeQuestion extends cxSelectQuestion implements Question {

    protected getContent(el: HTMLElement): string {
        let tmpel = <HTMLInputElement>el.querySelector("label > input,input");
        if (tmpel.value == "true") {
            return "对√";
        }
        return "错×";
    }

    protected click(el: HTMLElement) {
        (<HTMLElement>el.querySelector("label > input,input")).click();
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
        let el = this.el.querySelector(".Py_answer.clearfix");
        if (el.innerHTML.indexOf('正确答案') < 0) {
            if (el.querySelectorAll('.fr.dui').length <= 0 && el.querySelectorAll('.fr.cuo').length <= 0) {
                return null;
            }
        }
        let ret = this.defaultAnswer();
        let correctText = el.querySelector("span").innerText;
        if (correctText.indexOf('×') >= 0) {
            ret.correct.push({ option: false, content: false });
        } else {
            ret.correct.push({ option: true, content: true });
        }
        return ret;
    }
}

class cxFillQuestion extends cxCourseQuestion implements Question {

    protected getOption(el: HTMLElement): string {
        let tmpel = el.querySelector("span.fb");
        return substrex(tmpel.innerHTML, "第", "空");
    }

    public Random(): TopicStatus {
        return "no_support_random";
    }

    public Correct(): Answer {
        let correct = this.isCorrect();
        if (correct == null) {
            return null;
        }
        let ret = this.defaultAnswer();
        let options = this.el.querySelectorAll(".Py_tk span.font14");
        let isMy = false;
        if (options.length <= 0) {
            isMy = true;
            options = this.el.querySelectorAll(".Py_answer.clearfix .font14");
        }
        for (let i = 0; i < options.length; i++) {
            if (isMy && options[i].querySelectorAll(".fr.dui").length <= 0) {
                continue;
            }
            let optionEl = options[i].querySelector("i.fl");
            let option = {
                option: substrex(optionEl.innerHTML, "第", "空"),
                content: (<HTMLElement>options[i].querySelector(".clearfix")).innerText,
            };
            ret.correct.push(option);
        }
        return ret;
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

class cxExamSelectQuestion extends cxSelectQuestion {

}

class cxExamJudgeQuestion extends cxJudgeQuestion {

}

class cxExamFillQuestion extends cxFillQuestion {

}