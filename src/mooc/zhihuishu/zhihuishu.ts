import { Mooc } from "@App/mooc/factory";
import { Hook, Context } from "@App/internal/utils/hook";
import { Application } from "@App/internal/application";
import "../../views/common.css";

export class ZhsVideo implements Mooc {
    public Start(): void {
        this.hookAjax();
        let timer = setInterval(() => {
            try {
                this.start();
                clearInterval(timer);
            } catch (e) { }
        }, 500);
    }

    protected createToolsBar() {
        let tools = document.createElement('div');
        tools.className = "entrance_div"; tools.id = "cxtools";
        let ul = document.createElement("ul");
        tools.appendChild(ul);
        let li1 = document.createElement("li");
        ul.appendChild(li1);
        let boomBtn = document.createElement("a");
        boomBtn.href = "#"; boomBtn.id = "zhs-video-boom";
        boomBtn.innerText = "秒过视频";
        boomBtn.onclick = () => {

        }
        li1.appendChild(boomBtn);
        document.querySelector(".videotop_box.fl").append(tools);
    }

    protected start() {
        let hookPlayerStarter = new Hook("createPlayer", (<any>window).PlayerStarter);
        let self = this;
        hookPlayerStarter.Middleware(function (next: Context, ...args: any) {
            Application.App.log.Info("视频开始加载");
            self.createToolsBar();
            
            
            return next.apply(this, args);
        });
        let timeSetInterval = new Hook("setInterval", window);
        timeSetInterval.Middleware(function (next: Context, ...args: any) {
            Application.App.log.Debug("加速器启动");
            if (Application.App.config.super_mode) {
                args[1] = args[1] / Application.App.config.video_multiple;
            }
            return next.apply(this, args);
        });
    }

    protected hookAjax(): void {
        let self = this;
        let hookXMLHttpRequest = new Hook("open", window.XMLHttpRequest.prototype);
        hookXMLHttpRequest.Middleware(function (next: Context, ...args: any) {
            if (args[1].indexOf("popupAnswer/loadVideoPointerInfo") >= 0) {
                Object.defineProperty(this, "responseText", {
                    get: function () {
                        let retText = this.response.replace(
                            /"questionPoint":\[.*?\],"knowledgeCardDtos"/gm,
                            '"questionPoint":[],"knowledgeCardDtos"'
                        );
                        return retText;
                    }
                });
            }
            let ret = next.apply(this, args);
            return ret;
        });
    }

}