import {Launcher, Application} from "@App/internal/application";
import {Mooc, MoocFactory, MoocTask} from "@App/internal/app/mooc";
import {Task} from "@App/internal/app/task";

export class mooc implements Launcher {
    protected moocFactory: MoocFactory;

    constructor(moocFactory: MoocFactory) {
        this.moocFactory = moocFactory;
    }

    public async start() {
        try {
            let state = document.readyState;
            Application.App.log.Debug("Start document state:", state);
            let mooc = this.moocFactory.CreateMooc();
            if (mooc != null) {
                await mooc.Init();
                // MoocTask接口判断,接管流程
                if ((<MoocTask>mooc).Next != undefined) {
                    this.runMoocTask(<MoocTask>mooc);
                }
            }
        } catch (e) {
            Application.App.log.Fatal("扩展发生了一个致命错误:", e);
        }
        //最小化警告
        if (top == self) {
            let isShow = false;
            document.addEventListener("visibilitychange", () => {
                if (document.hidden) {
                    if (isShow) {
                        return;
                    }
                    Application.App.log.Warn("请注意!最小化可能导致视频无法正常播放!允许切换窗口.");
                    isShow = true;
                }
            })
        }
    }

    protected timer: NodeJS.Timeout;

    protected runMoocTask(moocTask: MoocTask) {
        moocTask.addEventListener("reload", () => {
            if (Application.App.config.auto) {
                this.runTask(moocTask);
            }
            clearTimeout(this.timer);
        });
        moocTask.addEventListener("complete", () => {
            Application.App.log.Warn("任务完成了");
            alert("任务完成了");
        });
        moocTask.addEventListener("error", (msg: string) => {
            Application.App.log.Fatal(msg);
            alert(msg);
        });
    }

    protected async runTask(moocTask: MoocTask) {
        let task = await moocTask.Next();
        console.log("task", task);
        while (task != null) {
            // if (task.Done()) {
            //     task = await moocTask.Next();
            //     continue;
            // }
            //开始任务
            task.addEventListenerOnce("complete", () => {
                if (!Application.App.config.auto) {
                    return;
                }
                let interval = Application.App.config.interval;
                Application.App.log.Info(interval + "分钟后自动切换下一个任务点");
                this.timer = setTimeout(async () => {
                    await task.Submit();
                    await this.runTask(moocTask);
                }, interval * 60000);
            })
            if (Application.App.config.auto) {
                await task.Start();
            }
            break;
        }
    }
}