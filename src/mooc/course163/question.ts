import { Topic, QueryQuestions } from "@App/internal/app/topic";
import { Question, TopicType, TopicStatus, Answer } from "@App/internal/app/question";

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
        if (el.querySelector("input[type='radio]")) {
            return new CourseQuestion(el, 1);
        } else if (el.querySelector("input[type='checkbox']")) {
            return new CourseQuestion(el, 2);
        }
        return new CourseQuestion(el, -1);
    }
}

class CourseQuestion implements Question {
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
        return this.el.querySelector(".f-richEditorText.j-richTxt").innerHTML;
    }

    public SetStatus(status: TopicStatus): void {

    }

    public Random(): TopicStatus {
        return "random";
    }

    public Fill(answer: Answer): TopicStatus {
        return "no_match";
    }

    public Correct(): Answer {
        return null;
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