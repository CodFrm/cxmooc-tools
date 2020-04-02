import {Mooc} from "../factory";
import {Hook, Context} from "@App/internal/utils/hook";
import {createBtn, substrex, protocolPrompt} from "@App/internal/utils/utils";
import "../../views/common";
import {CourseTopic, CourseQueryAnswer} from "./question";
import {
    ToolsQuestionBankFacade,
    ToolsQuestionBank,
    QuestionBank,
    QuestionBankFacade,
    Answer,
    Option,
    PushAnswer,
    QuestionStatusString
} from "@App/internal/app/question";
import {Application} from "@App/internal/application";
import {TaskFactory} from "@App/mooc/course163/task";
import {Task} from "@App/internal/app/task";

export class Course163 implements Mooc {

    protected lastTask: Task;

    public Start(): void {
        this.hookAjax();
    }

    protected hookAjax() {
        Hook.HookAjaxRespond(["CourseBean.getLessonUnitLearnVo.dwr", "MocQuizBean.getQuizPaperDto.dwr"], (url, resp) => {
            let task = TaskFactory.CreateTask(resp);
            if (task) {
                setTimeout(async () => {
                    this.lastTask && await this.lastTask.Stop();
                    this.lastTask = task;
                    this.lastTask.addEventListener("complete", () => {
                        this.delay(async () => {
                            await this.lastTask.Submit();
                            this.nextTask();
                        });
                    });
                    await this.lastTask.Init();
                    if (Application.App.config.auto) {
                        let autonext = <HTMLInputElement>document.querySelector(".j-autoNext");
                        if (autonext && autonext.checked) {
                            autonext.click();
                        }
                        await this.lastTask.Start();
                    }
                }, 0);
            }
            return resp;
        });
        Hook.HookAjaxRespond("MocQuizBean.fetchQuestions", (url, resp) => {
            if (resp.indexOf("{questions:s0}") > 0) {
                resp = resp.replace("{questions:s0}", "{questions:{}}");
            }
            return resp;
        })
    }

    protected nextTask() {
        let unit = document.querySelectorAll(".j-unitslist.unitslist.f-cb > .f-fl");
        let flag = false;
        for (let i = 0; i < unit.length; i++) {
            if (unit[i].className.indexOf("current") > 0) {
                flag = true;
            } else if (flag) {
                this.delay(() => {
                    (<HTMLInputElement>unit[i]).click();
                });
                return;
            }
        }
    }

    protected delayTimer: NodeJS.Timer;

    protected delay(func: Function) {
        let interval = Application.App.config.interval;
        Application.App.log.Info(interval + "分钟后自动切换下一个任务点");
        clearInterval(this.delayTimer);
        this.delayTimer = setTimeout(() => {
            Application.App.config.auto && func();
        }, interval * 60000);
    }

}