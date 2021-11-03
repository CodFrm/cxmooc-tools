import { substrex, randNumber as RandNumber, removeHTMLTag } from "@App/internal/utils/utils";
import {
    Question,
    TopicStatus,
    TopicStatusString,
    TopicType,
    SwitchTopicType,
    Option,
    Answer,
    PushAnswer
} from "@App/internal/app/question";
import { CreateNoteLine } from "./utils";

//TODO: 优化
export class CxQuestionFactory {
    public static CreateCourseQuestion(context: any, el: HTMLElement): Question {
        let ret = SwitchTopicType(substrex(el.innerText, '【', '】'));
        return this.CreateCourseQuestionByTopicType(context, ret, el);
    }

    public static CreateExamQuestion(context: any, type: TopicType, el: HTMLElement): Question {
        let processor = new ExamQuestionProcessor();
        let ret: Question = null;
        this.RemoveNotice(el);
        switch (type) {
            case 1:
            case 2: {
                ret = new cxExamSelectQuestion(context, el, type, processor);
                break;
            }
            case 3: {
                ret = new cxExamJudgeQuestion(context, el, type, processor);
                break;
            }
            case 4: {
                ret = new cxExamFillQuestion(context, el, type, processor);
                break;
            }
            default: {
                this.AddNotice(el, "不支持的类型");
                return null
            }
        }
        return ret;
    }

    public static CreateCourseQuestionByTopicType(context: any, type: TopicType, el: HTMLElement): Question {
        let ret: Question = null;
        let processor = new CourseQuestionProcessor();
        this.RemoveNotice(el);
        switch (type) {
            case 1:
            case 2: {
                ret = new cxSelectQuestion(context, el, type, processor);
                break;
            }
            case 3: {
                ret = new cxJudgeQuestion(context, el, type, processor);
                break;
            }
            case 4: {
                ret = new cxFillQuestion(context, el, type, processor);
                break;
            }
            default: {
                this.AddNotice(el, "不支持的类型");
                return null
            }
        }
        return ret;
    }

    protected static getBeforeType(el: HTMLElement): HTMLElement {
        let before = el.previousElementSibling;
        do {
            if (before.className == "Cy_TItle1") {
                return <HTMLElement>before;
            }
            before = before.previousElementSibling;
        } while (before != null)
        return null;
    }

    public static CreateHomeWorkQuestion(context: any, el: HTMLElement): Question {
        let ret = CxQuestionFactory.getBeforeType(el);
        return this.CreateCourseQuestionByTopicType(context, SwitchTopicType(substrex(ret.innerText, ".", "（")), el);
    }

    //TODO:写的什么玩意啊
    public static CreateExamCollectQuestion(context: any, el: HTMLElement): Question {
        let ret = CxQuestionFactory.getBeforeType(el.parentElement);
        let txt = ret.innerText.match(/、(.*?)[\s|（]/)[1];
        return this.CreateExamQuestionByTopicType(context, SwitchTopicType(txt), el);
    }

    public static CreateExamQuestionByTopicType(context: any, type: TopicType, el: HTMLElement): Question {
        let ret: Question = null;
        let processor = new CourseQuestionProcessor();
        this.RemoveNotice(el);
        switch (type) {
            case 1:
            case 2: {
                ret = new cxSelectQuestion(context, el, type, processor);
                break;
            }
            case 3: {
                ret = new cxJudgeQuestion(context, el, type, processor);
                break;
            }
            case 4: {
                ret = new cxExamFillQuestion(context, el, type, processor);
                break;
            }
            default: {
                this.AddNotice(el, "不支持的类型");
                return null
            }
        }
        return ret;
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

//TODO: 优化
export interface QuestionProcessor {
    GetTopic(el: HTMLElement): string
}

class CourseQuestionProcessor implements QuestionProcessor {
    public GetTopic(el: HTMLElement): string {
        let ret = el.querySelector(".Zy_TItle > .clearfix,.Cy_TItle > .clearfix").innerHTML;
        ret = ret.substring(ret.indexOf('】') + 1);
        if (/（(.+?)分）($|\s)/.test(ret)) {
            ret = ret.substring(0, ret.lastIndexOf("（"));
        }
        return ret;
    }
}

class ExamQuestionProcessor implements QuestionProcessor {
    public GetTopic(el: HTMLElement): string {
        let ret = el.querySelector(".Cy_TItle.clearfix .clearfix").innerHTML;
        ret = ret.substr(0, ret.lastIndexOf('分）'));
        ret = ret.substr(0, ret.lastIndexOf('（'));
        return ret;
    }
}

abstract class cxQuestion implements Question {

    protected el: HTMLElement;
    protected type: TopicType;
    protected processor: QuestionProcessor;
    protected context: Window;

    constructor(context: Window, el: HTMLElement, type: TopicType, processor: QuestionProcessor) {
        this.context = context;
        this.el = el;
        this.type = type;
        this.processor = processor;
    }

    public abstract Random(): TopicStatus;

    public abstract Correct(): Answer;

    public abstract Fill(answer: Answer): Promise<TopicStatus>;

    public SetStatus(status: TopicStatus) {
        this.AddNotice(TopicStatusString(status));
    }

    public GetTopic(): string {
        return this.processor.GetTopic(this.el);
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
        let tmpel = <HTMLElement>this.el.querySelector(".clearfix > ul,.clearfix ul.Zy_ulBottom.clearfix,ul.Zy_ulTk");
        let list = tmpel.querySelectorAll("li");
        return list;
    }

    protected isCorrect(): Element {
        let el = this.el.querySelector(".Py_answer.clearfix,.Py_tk");
        if (el) {
            if (el.querySelectorAll('.fr.dui').length > 0 || el.querySelectorAll('.fr.bandui').length > 0) {
                return el;
            } else if (el.innerHTML.indexOf('正确答案') >= 0) {
                return el;
            }
        }
        let topic = this.el.querySelector(".Cy_TItle.clearfix")
        if (!topic) {
            return null;
        }
        let fs = topic.querySelector(".font18.fb");
        if (fs && fs.innerHTML != "0.0") {
            return el;
        }
        return null;
    }

    protected defaultAnswer(): Answer {
        let ret = new PushAnswer();
        ret.topic = this.GetTopic();
        ret.type = this.GetType();
        ret.correct = new Array();
        ret.answers = new Array();
        return ret;
    }
}

class cxSelectQuestion extends cxQuestion implements Question {

    protected getContent(el: HTMLElement): string {
        let ret = el.querySelector("a");
        if (ret == null) {
            let tmpel = <HTMLInputElement>el.querySelector("label > input,input");
            if (tmpel.value == "true") {
                return "对√";
            }
            return "错×";
        }
        return ret.innerHTML;
    }

    protected getOption(el: HTMLElement): string {
        return el.querySelector("input").value;
    }

    protected click(el: HTMLElement, content: string) {
        let ipt = (<HTMLInputElement>el.querySelector("label > input"));
        if (!ipt.checked) {
            ipt.click();
        }
        this.AddNotice(this.getOption(el) + ":" + content);
    }

    public Random(): TopicStatus {
        let options = this.options();
        let pos = RandNumber(0, options.length - 1);
        this.click(options[pos], this.getContent(options[pos]));
        return "random";
    }

    public Fill(s: Answer): Promise<TopicStatus> {
        return new Promise(resolve => {
            let options = this.options();
            let flag = false;
            for (let i = 0; i < s.correct.length; i++) {
                for (let j = 0; j < options.length; j++) {
                    if (s.correct[i].content.trim() == "") {
                        if (this.getOption(options[j]) == s.correct[i].option) {
                            this.click(options[j], this.getContent(options[j]));
                            flag = true;
                        }
                    } else if (s.Equal(this.getContent(options[j]), s.correct[i].content)) {
                        this.click(options[j], s.correct[i].content);
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
        let correct = this.isCorrect();
        if (correct == null) {
            return null;
        }
        let ret = this.defaultAnswer();
        let options = this.el.querySelectorAll(".Zy_ulTop > li.clearfix,.Cy_ulTop li");
        let correctText = correct.querySelector("span").innerText;
        for (let i = 0; i < options.length; i++) {
            let optionText = (<HTMLElement>options[i].querySelector("i.fl")).innerText;
            let option = {
                option: optionText.substring(0, 1),
                content: options[i].querySelector("a.fl,a").innerHTML,
            };
            ret.answers.push(option);
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
        let tmpel = (<HTMLInputElement>el.querySelector("label > input,input"));
        if (!tmpel.checked) {
            tmpel.click();
        }
        this.AddNotice(this.getContent(el));
    }

    public Random(): TopicStatus {
        let options = this.options();
        let pos = RandNumber(0, 1);
        this.click(options[pos]);
        return "random";
    }

    public Fill(answer: Answer): Promise<TopicStatus> {
        return new Promise<TopicStatus>(resolve => {
            let options = this.options();
            this.click(options[answer.correct[0].content ? 0 : 1]);
            return resolve("ok");
        })
    }

    public Correct(): Answer {
        let el = this.el.querySelector(".Py_answer.clearfix");
        let ret = this.defaultAnswer();
        let score = this.el.querySelector(".Cy_TItle.clearfix .font18.fb");
        if (el.innerHTML.indexOf('正确答案') !== -1 || (score && score.querySelector(".Cy_TItle.clearfix .font18.fb").innerHTML != "0.0")) {
            let correctText = el.querySelector("span").innerText;
            if (correctText.indexOf('×') !== -1) {
                ret.correct.push({ option: false, content: false });
            } else {
                ret.correct.push({ option: true, content: true });
            }
            return ret;
        }
        if (!el.querySelectorAll('.fr.dui').length && !el.querySelectorAll('.fr.cuo').length) {
            return null;
        }
        let correctText = el.querySelector("span").innerText;
        if (el.querySelectorAll('.fr.dui').length) {
            if (correctText.indexOf('×') !== -1) {
                ret.correct.push({ option: false, content: false });
            } else {
                ret.correct.push({ option: true, content: true });
            }
        } else {
            if (correctText.indexOf('×') !== -1) {
                ret.correct.push({ option: true, content: true });
            } else {
                ret.correct.push({ option: false, content: false });
            }
        }
        return ret;
    }
}

class cxFillQuestion extends cxQuestion implements Question {

    protected getOption(el: HTMLElement): string {
        if (el.className == "XztiHover1") {
            return substrex(el.previousElementSibling.innerHTML, "第", "空");
        }
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

    public Fill(answer: Answer): Promise<TopicStatus> {
        return new Promise<TopicStatus>(resolve => {
            let options = this.options();
            if (!options.length) {
                options = this.el.querySelector('.Zy_ulTk').querySelectorAll(".XztiHover1");
            }
            let flag = 0;
            for (let i = 0; i < answer.correct.length; i++) {
                for (let j = 0; j < options.length; j++) {
                    if (this.getOption(options[j]) == answer.correct[i].option) {
                        flag++;
                        let el = <HTMLInputElement>options[j].querySelector("input.inp");
                        if (!el) {
                            let uedit = (<any>this.context).$(options[j]).find('textarea');
                            if (uedit.length <= 0) {
                                this.AddNotice(this.getOption(options[j]) + "空发生了一个错误");
                                continue;
                            }
                            (<any>this.context).UE.getEditor(uedit.attr('name')).setContent(answer.correct[i].content);
                            this.AddNotice(this.getOption(options[j]) + ":" + answer.correct[i].content);
                        } else {
                            el.value = removeHTMLTag(answer.correct[i].content);
                            this.AddNotice(this.getOption(options[j]) + ":" + answer.correct[i].content);
                        }
                    }
                }
            }
            if (flag == options.length) {
                return resolve("ok");
            }
            return resolve("no_match");
        });
    }

}

//TODO: 优化
class cxExamSelectQuestion extends cxSelectQuestion {

    protected options(): NodeListOf<HTMLLIElement> {
        return this.el.querySelectorAll(".Cy_ulBottom.clearfix.w-buttom li input");
    }

    protected getContent(el: HTMLElement): string {
        let textOption = this.el.querySelectorAll(".Cy_ulTop.w-top li div.clearfix a");
        let tmpli = el.parentElement.parentElement;
        let pos = -1;
        do {
            tmpli = <HTMLElement>tmpli.previousElementSibling;
            pos++;
        } while (tmpli != null);
        return textOption[pos].innerHTML;
    }

    protected getOption(el: HTMLElement): string {
        return el.parentElement.innerText;
    }

    protected click(el: HTMLElement, content: string) {
        el.click();
        this.AddNotice(this.getOption(el) + ":" + content);
    }
}

class cxExamFillQuestion extends cxFillQuestion {

    protected options(): NodeListOf<HTMLLIElement> {
        return this.el.querySelectorAll(".Cy_ulTk .XztiHover1");
    }

    protected getOption(el: HTMLElement): string {
        let tmpel = el.querySelector(".fb.font14");
        return substrex(tmpel.innerHTML, "第", "空");
    }

    public Fill(answer: Answer): Promise<TopicStatus> {
        return new Promise<TopicStatus>(resolve => {
            let options = this.options();
            let flag = 0;
            for (let i = 0; i < answer.correct.length; i++) {
                for (let j = 0; j < options.length; j++) {
                    if (this.getOption(options[j]) == answer.correct[i].option) {
                        flag++;
                        let uedit = (<any>window).$(options[j]).find('textarea');
                        if (uedit.length <= 0) {
                            this.AddNotice(this.getOption(options[j]) + "空发生了一个错误");
                            continue;
                        }
                        (<any>window).UE.getEditor(uedit.attr('name')).setContent(answer.correct[i].content);
                        this.AddNotice(this.getOption(options[j]) + ":" + answer.correct[i].content);
                    }
                }
            }
            if (flag == options.length) {
                return resolve("ok");
            }
            return resolve("no_match");
        });
    }

    public Correct(): Answer {
        let correct = this.isCorrect();
        if (correct == null) {
            return null;
        }
        let ret = this.defaultAnswer();
        let options = this.el.querySelectorAll(".Py_tk div[id] span.font14");
        let isMy = false;
        if (options.length <= 0) {
            isMy = true;
            options = this.el.querySelectorAll(".Py_answer.clearfix .font14");
        }
        for (let i = 0; i < options.length; i++) {
            if (isMy && options[i].querySelectorAll(".fr.dui").length <= 0) {
                continue;
            }
            let optionEl = options[i].querySelector("i");
            let option = {
                option: substrex(optionEl.innerHTML, "第", "空"),
                content: options[i].innerHTML.substr(options[i].innerHTML.indexOf("</i>") + 4),
            };
            ret.correct.push(option);
        }
        return ret;
    }

}

class cxExamJudgeQuestion extends cxJudgeQuestion {

    protected options(): NodeListOf<HTMLLIElement> {
        return this.el.querySelectorAll(".Cy_ulBottom.clearfix li");
    }

}