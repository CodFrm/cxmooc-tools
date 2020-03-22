import { Mooc } from "../factory";
import { createBtn, substrex, randNumber } from "@App/internal/utils/utils";
import "../../views/common.css"
import { Topic, QueryQuestions } from "@App/internal/app/topic";
import { Question, ToolsQuestionBankFacade, ToolsQuestionBank, TopicType, SwitchTopicType, TopicStatus, Answer, TopicStatusString } from "@App/internal/app/question";
import { CreateNoteLine } from "../chaoxing/utils";
import { Application } from "@App/internal/application";

export class ZhsExam implements Mooc {

    protected topic: Topic;

    public Start(): void {
        this.topic = new ExamTopic(document, new ToolsQuestionBankFacade(new ToolsQuestionBank("zhs")));
        this.topic.SetQueryQuestions(new ExamQueryQuestion());
        window.onload = () => {
            setTimeout(() => {
                document.oncontextmenu = () => { }
                document.oncopy = () => { }
                document.onpaste = () => { }
                document.onselectstart = () => { }
                if (document.querySelectorAll(".examInfo.infoList.clearfix").length <= 0) {
                    this.createBtn();
                } else {
                    this.topic.CollectAnswer();
                }
            }, 1000);
        }
    }

    protected createBtn() {
        let el = document.querySelector(".examPaper_partTit.mt20 ul");
        let btn = createBtn("搜索答案", "点击搜索答案", "zhs-search-answer green")
        el.append(btn);
        let self = this;
        btn.onclick = async function () {
            btn.innerText = "搜索中...";
            let ret = await self.topic.QueryAnswer();
            btn.innerText = ret;
            return false;
        }
    }

}

class ExamQueryQuestion implements QueryQuestions {

    public QueryQuestions(): Question[] {
        let timu = document.querySelectorAll(".examPaper_subject.mt20,.questionType");
        let ret = new Array();
        timu.forEach((val: HTMLElement) => {
            let el = val.querySelector(".subject_type_annex .subject_type");
            let type = SwitchTopicType(substrex(el.innerHTML, "【", "】"));
            let question = this.createQuestion(type, val);
            ret.push(question);
        });
        return ret;
    }

    protected createQuestion(type: TopicType, el: HTMLElement): Question {
        switch (type) {
            case 1: case 2: {
                return new ZhsSelectQuestion(el, type);
            }
            case 3: {
                return new ZhsJudgeQuestion(el, type);
            }
            default: {
                return new ZhsSelectQuestion(el, -1);
            }
        }
    }

}

abstract class ZhsQuestion implements Question {
    protected el: HTMLElement;
    protected type: TopicType;
    constructor(el: HTMLElement, type: TopicType) {
        this.el = el;
        this.type = type;
    }

    public GetType(): TopicType {
        return this.type;
    }

    public GetTopic(): string {
        let el = this.el.querySelector(".subject_type_describe.fl .subject_describe");
        return el.innerHTML;
    }

    protected removeNotice() {
        this.el.querySelectorAll(".prompt-line-answer").forEach((v) => {
            v.remove()
        });
    }

    protected addNotice(str: string) {
        let el = (<HTMLElement>this.el.querySelector(".subject_node.mt10,.subject_node"));
        CreateNoteLine(str, "answer", el);
    }

    public SetStatus(status: TopicStatus): void {
        this.addNotice(TopicStatusString(status));
    }

    public abstract Random(): TopicStatus;

    public abstract Fill(s: Answer): TopicStatus;

    public abstract Correct(): Answer;


    protected options(): NodeListOf<HTMLLIElement> {
        return this.el.querySelectorAll(".subject_node .nodeLab");
    }

    protected getOption(el: HTMLElement): string {
        let tmpel = el.querySelector(".mr10");
        return (<HTMLInputElement>tmpel).innerText.substring(0, 1);
    }

    protected click(el: HTMLElement, content: string) {
        el.querySelector("input").click();
        this.addNotice(this.getOption(el) + ":" + content);
    }

    protected getContent(el: HTMLElement): string {
        let tmpel = el.querySelector(".node_detail.examquestions-answer.fl");
        return tmpel.innerHTML;
    }

}

class ZhsSelectQuestion extends ZhsQuestion {
    public Random(): TopicStatus {
        let options = this.options();
        let pos = randNumber(0, options.length - 1);
        this.click(options[pos], this.getContent(options[pos]));
        return "random";
    }

    public Fill(s: Answer): TopicStatus {
        let options = this.options();
        for (let i = 0; i < options.length; i++) {
            if (options[i].querySelector("input").checked) {
                options[i].querySelector("input").click();
            }
        }
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
        throw new Error("Method not implemented.");
    }
}


class ZhsJudgeQuestion extends ZhsQuestion {

    public Random(): TopicStatus {
        let options = this.options();
        this.click(options[randNumber(0, 1)]);
        return "random";
    }

    protected click(el: HTMLElement) {
        (<HTMLElement>el.querySelector("label > input,input")).click();
        this.addNotice(this.getContent(el));
    }

    public Fill(answer: Answer): TopicStatus {
        let options = this.options();
        this.click(options[answer.correct[0].content ? 0 : 1]);
        return "ok";
    }

    public Correct(): Answer {
        throw new Error("Method not implemented.");
    }

}

class ExamTopic extends Topic {

    public Init(): Promise<any> {
        return null;
    }

    public Submit(): Promise<any> {
        return null;
    }

}