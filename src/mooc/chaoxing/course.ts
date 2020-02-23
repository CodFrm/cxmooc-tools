import { Mooc, MoocFactory } from "../factory";
import { Task, VideoFactory, TaskFactory, TopicFactory } from "./task";
import { Application } from "@App/internal/application";
export class CxCourseFactory implements MoocFactory {
    public CreateMooc(): Mooc {
        return new CxCourse();
    }
}
export class CxCourse implements Mooc {
    public Start(): void {
        document.addEventListener(
            "load",
            ev => {
                var el = <HTMLIFrameElement>(ev.srcElement || ev.target);
                if (el.id == "iframe") {
                    Application.App.log.Info("超星新窗口加载");
                    this.OperateCard(el);
                }
            },
            true
        );
    }

    public OperateCard(iframe: HTMLIFrameElement) { }
}

export class CxCourseCardFactory implements MoocFactory {
    CreateMooc(): Mooc {
        return new CxCourseCard();
    }
}

export class CxCourseCard implements Mooc {
    protected attachments: Array<any>;
    Start(): void {
        let self = this;
        document.addEventListener("readystatechange", function () {
            if (document.readyState != "interactive") {
                return;
            }
            Application.App.log.Info("超星任务点启动", document.readyState);
            let iframeWindow: any = window;
            self.attachments = <Array<any>>iframeWindow.mArg.attachments;
            self.attachments.forEach((value: any, index: number) => {
                let task: Task;
                let taskFactory: TaskFactory;
                switch (value.type) {
                    case "video": {
                        taskFactory = new VideoFactory();
                        break;
                    }
                    case "workid": {
                        taskFactory = new TopicFactory();
                        break;
                    }
                    default:
                        break;
                }
                task = taskFactory.CreateTask(iframeWindow, value);
                task.Complete(function () {
                    self.taskComplete(task, index);
                });
            });
            Application.App.log.Debug("任务点参数", self.attachments);
        });
    }

    protected taskComplete(task: Task, index: number) { }
}
