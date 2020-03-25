import { Mooc } from "../factory";
import { createBtn, substrex, randNumber, protocolPrompt } from "@App/internal/utils/utils";
import "../../views/common";
import { Topic, QueryQuestions } from "@App/internal/app/topic";
import { Question, ToolsQuestionBankFacade, ToolsQuestionBank, TopicType, SwitchTopicType, TopicStatus, Answer, TopicStatusString, PushAnswer } from "@App/internal/app/question";
import { CreateNoteLine } from "../chaoxing/utils";

//TODO: 与超星一起整合优化
export class ZhsExam implements Mooc {

    protected topic: Topic;

    public Start(): void {
        this.topic = new ExamTopic(document, new ToolsQuestionBankFacade(new ToolsQuestionBank("zhs", {
            refer: document.URL,
            id: document.URL.match(/(checkHomework|dohomework)\/(.*?)\/(.*?)\/(.*?)\/(.*?)\/(.*?)$/)[4],
        })));
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
            protocolPrompt("你正准备使用智慧树答题功能,相应的我们需要你的正确答案,因为智慧树的机制问题,采集答案会导致无法重新作答,你是否愿意贡献你的答案?\n* 本项选择不会影响你的正常使用(协议当前版本有效)\n* 手动点击答题结果页面自动采集页面答案\n* (功能其实还没完成,后续更新)", "zhs_answer_collect", "我同意");

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
        let tmpel = el.querySelector(".mr10,span.mr5");
        return (<HTMLInputElement>tmpel).innerText.substring(0, 1);
    }

    protected click(el: HTMLElement, content: string) {
        let tmpel = <HTMLInputElement>el.querySelector("input");
        if (!tmpel.checked) {
            tmpel.click();
        }
        this.addNotice(this.getOption(el) + ":" + content);
    }

    protected getContent(el: HTMLElement): string {
        let tmpel = el.querySelector(".node_detail.examquestions-answer.fl");
        return tmpel.innerHTML;
    }

    protected defaultAnswer(): Answer {
        let ret = new PushAnswer();
        ret.topic = this.GetTopic();
        ret.type = this.GetType();
        ret.correct = new Array();
        ret.answers = new Array();
        return ret;
    }

    protected isCorrect(): boolean {
        return this.el.querySelector(".key_yes") != null;
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
        if (!this.isCorrect()) {
            return null;
        }
        let ret = this.defaultAnswer();
        let options = this.options();
        for (let i = 0; i < options.length; i++) {
            let option = {
                option: this.getOption(options[i]),
                content: this.getContent(options[i]),
            };
            ret.answers.push(option);
            if (options[i].querySelector("input").checked) {
                ret.correct.push(option);
            }
        }
        return ret;
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
        if (!this.isCorrect()) {
            return null;
        }
        let ret = this.defaultAnswer();
        let answer = this.getContent(this.el.querySelector("input:checked").parentElement.parentElement) == "对";
        ret.correct.push({
            option: answer,
            content: answer,
        });
        return ret;
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