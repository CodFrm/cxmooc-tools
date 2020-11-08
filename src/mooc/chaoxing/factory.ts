import {CxVideoControlBar, Video} from "@App/mooc/chaoxing/video";
import {
    CxCourseQueryQuestion,
    CxCourseTopic,
    CxTopicControlBar,
    ExamTopic, HomeworkTopic,
    TopicAdapter
} from "@App/mooc/chaoxing/topic";
import {Question, QuestionStatusString, ToolsQuestionBankFacade} from "@App/internal/app/question";
import {CxQuestionFactory} from "@App/mooc/chaoxing/question";
import {Application} from "@App/internal/application";
import {CxTaskControlBar, CxTask} from "@App/mooc/chaoxing/task";
import {CssBtn} from "@App/mooc/chaoxing/utils";
import {createBtn} from "@App/internal/utils/utils";
import {CxAudioControlBar, CxAudioTask, CxDocumentTask} from "@App/mooc/chaoxing/special";

// 任务工厂,创建对应的任务
export class TaskFactory {

    public static CreateCourseTask(context: any, taskinfo: any): CxTask {
        if (taskinfo.property.module == "insertaudio") {
            taskinfo.type = "audio";
        }
        //TODO:优化
        if (taskinfo.type != "video" && taskinfo.type != "workid" && taskinfo.type != "document"
            && taskinfo.type != "audio") {
            return null;
        }
        let task: CxTask;
        let taskIframe = <HTMLIFrameElement>(<Window>context).document.querySelector(
            "iframe[jobid='" + taskinfo.jobid + "']"
        );
        let prev: HTMLElement;
        if (taskIframe == undefined) {
            taskIframe = <HTMLIFrameElement>(<Window>context).document.querySelector(
                "iframe[data*='" + taskinfo.property.mid + "'],iframe[objectid='" + taskinfo.property.objectid + "']"
            );
            prev = document.createElement("div");
            taskIframe.parentElement.prepend(prev);
        } else {
            prev = <HTMLElement>taskIframe.previousElementSibling
        }
        switch (taskinfo.type) {
            case "video": {
                let bar = new CxVideoControlBar(prev, new Video(taskIframe.contentWindow, taskinfo));
                task = bar.task;
                (<Video>task).muted = Application.App.config.video_mute;
                (<Video>task).playbackRate = Application.App.config.video_multiple;
                break;
            }
            case "workid": {
                let contentWindow = (<HTMLIFrameElement>taskIframe.contentWindow.document.querySelector("#frame_content")).contentWindow;
                taskinfo.refer = (<Window>context).document.URL;
                taskinfo.id = taskinfo.property.workid;
                taskinfo.info = taskinfo.property.workid;
                let topic = new CxCourseTopic(contentWindow, new ToolsQuestionBankFacade("cx", {
                    refer: (<Window>context).document.URL, id: taskinfo.property.workid, info: taskinfo.property.workid,
                }));
                topic.SetQueryQuestions(new CxCourseQueryQuestion(contentWindow, (context: any, el: HTMLElement): Question => {
                    return CxQuestionFactory.CreateCourseQuestion(context, el);
                }));
                let bar = new CxTopicControlBar(prev, new TopicAdapter(context, taskinfo, topic));
                if (Application.App.config.answer_ignore) {
                    return null;
                }
                task = bar.task;
                break;
            }
            case "document": {
                let bar = new CxTaskControlBar(prev, new CxDocumentTask(taskIframe.contentWindow, taskinfo));
                bar.append(bar.download());
                task = bar.task;
                (<Video>task).muted = Application.App.config.video_mute;
                (<Video>task).playbackRate = Application.App.config.video_multiple;
                break;
            }
            case "audio": {
                let bar = new CxAudioControlBar(prev, new CxAudioTask(taskIframe.contentWindow, taskinfo));
                task = bar.task;
                (<Video>task).muted = Application.App.config.video_mute;
                (<Video>task).playbackRate = Application.App.config.video_multiple;
                break;
            }
            default:
                return null;
        }
        return task;
    }

    public static CreateExamTopicTask(context: any, taskinfo: any): CxTask {
        let topic = new ExamTopic(context, new ToolsQuestionBankFacade("cx", taskinfo));
        let task = new TopicAdapter(context, taskinfo, topic);
        if (document.URL.indexOf("exam/test/reVersionTestStartNew") > 0) {
            topic.SetQueryQuestions(topic);
            let btn = CssBtn(createBtn("搜索答案", "搜索题目答案"));
            document.querySelector(".Cy_ulBottom.clearfix.w-buttom,.Cy_ulTk,.Cy_ulBottom.clearfix").append(btn);
            btn.onclick = () => {
                btn.innerText = "答案搜索中...";
                try {
                    task.Start().then((ret: any) => {
                        ret = ret || "搜索题目";
                        btn.innerText = QuestionStatusString(ret);
                    });
                } catch (e) {
                }
                return false;
            };
        } else {
            topic.SetQueryQuestions(new CxCourseQueryQuestion(context, (context: any, el: HTMLElement): Question => {
                return CxQuestionFactory.CreateExamCollectQuestion(context, el);
            }));
        }
        return task;
    }

    public static CreateHomeworkTopicTask(context: any, taskinfo: any): CxTask {
        let bank = new ToolsQuestionBankFacade("cx", taskinfo);
        let topic = new HomeworkTopic(context, bank);
        topic.SetQueryQuestions(new CxCourseQueryQuestion(context, (context: any, el: HTMLElement): Question => {
            return CxQuestionFactory.CreateHomeWorkQuestion(context, el);
        }));
        let task = new TopicAdapter(context, taskinfo, topic);
        let btn = CssBtn(createBtn("搜索答案", "搜索题目答案"));
        if ((<HTMLInputElement>document.querySelector("input#workRelationId"))) {
            document.querySelector(".CyTop").append(btn);
            btn.onclick = async () => {
                btn.innerText = "答案搜索中...";
                task.Start().then((ret: any) => {
                    ret = ret || "搜索题目";
                    btn.innerText = QuestionStatusString(ret);
                });
            };
        }
        return task;
    }

}
