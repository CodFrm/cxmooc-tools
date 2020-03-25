import { Topic, QueryQuestions } from "@App/internal/app/topic";
import { Question, TopicType, TopicStatus, Answer, TopicStatusString } from "@App/internal/app/question";
import { CreateNoteLine } from "../chaoxing/utils";
import { randNumber } from "@App/internal/utils/utils";

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
        if (el.querySelector("input[type='radio']") != null) {
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
        return this.el.querySelector(".f-richEditorText.j-richTxt").innerHTML;
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
            el.parentElement.querySelector("input").click();
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
    public Fill(answer: Answer): TopicStatus {
        let options = this.options();
        let flag = false;
        for (let i = 0; i < answer.correct.length; i++) {
            for (let n = 0; n < options.length; n++) {
                if (answer.Equal(this.getContent(options[n]), answer.correct[i].content)) {
                    this.fill(options[n], answer.correct[i].content);
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

class FillQuestion extends CourseQuestion {
    public Random(): TopicStatus {
        return "no_support_random";
    }

    public Fill(answer: Answer): TopicStatus {
        let el = this.el.querySelector("textarea");
        el.focus();
        el.value = answer.correct[0].content;
        this.AddNotice("填空:" + answer.correct[0].content);
        return "ok";
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