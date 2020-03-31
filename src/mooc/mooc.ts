import {Launcher, Application} from "@App/internal/application";
import {MoocFactory} from "./factory";

export class mooc implements Launcher {
    protected moocFactory: MoocFactory;

    constructor(moocFactory: MoocFactory) {
        this.moocFactory = moocFactory;
    }

    public start() {
        try {
            let state = document.readyState;
            Application.App.log.Debug("Start document state:", state);
            let mooc = this.moocFactory.CreateMooc();
            if (mooc != null) {
                mooc.Start();
            }
        } catch (e) {
            Application.App.log.Fatal("插件发生了一个致命错误:", e);
        }
        //最小化警告
        if (top == self) {
            let lastTime = 0;
            document.addEventListener("visibilitychange", () => {
                if (document.hidden) {
                    let now = new Date().valueOf() / 1000;
                    if (now - lastTime < 60) {
                        return;
                    }
                    Application.App.log.Warn("请注意!最小化可能导致视频无法正常播放!允许切换窗口.");
                    lastTime = now;
                }
            })
        }
    }
}