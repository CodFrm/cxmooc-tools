import { Application } from "../application";
import "../../views/common";
import { Noifications } from "@App/internal/utils/utils";

export interface Logger {
    Debug(...args: any): Logger;

    Info(...args: any): Logger;

    Warn(...args: any): Logger;

    Error(...args: any): Logger;

    Fatal(...args: any): Logger;
}

// 开发者工具f12处打印日志
export class ConsoleLog implements Logger {
    protected getNowTime(): string {
        let time = new Date();
        return time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds();
    }

    public Debug(...args: any): Logger {
        Application.App.debug && console.info("[debug", this.getNowTime(), "]", ...args);
        return this;
    }

    public Info(...args: any): Logger {
        Application.App.debug && console.info("[info", this.getNowTime(), "]", ...args);
        return this;
    }

    public Warn(...args: any): Logger {
        console.warn("[warn", this.getNowTime(), "]", ...args);
        return this;
    }

    public Error(...args: any): Logger {
        console.error("[error", this.getNowTime(), "]", ...args);
        return this;
    }

    public Fatal(...args: any): Logger {
        console.error("[fatal", this.getNowTime(), "]", ...args);
        return this;
    }
}

export class PageLog implements Logger {
    protected el: HTMLElement;
    protected div: HTMLElement;
    protected is_notify: boolean;

    protected getNowTime(): string {
        let time = new Date();
        return time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds();
    }

    first(text: string, color: string, background: string) {
        let new_log = document.createElement("div");
        new_log.innerHTML =
            `
                <div class="log" style="border-color: ` +
            background +
            `; background-color: ` +
            background +
            `;">
                    <p><span style="color:` +
            color +
            `;">` +
            text +
            `</span></p>
                </div>
            `;
        //插入第一个元素前
        var first = document
            .getElementsByClassName("tools-notice-content")[0]
            .getElementsByTagName("div");
        document.querySelector(".tools-notice-content").insertBefore(new_log, first[0]);
    }

    constructor() {
        this.el = undefined;
        window.addEventListener("load", () => {
            this.div = document.createElement("div");
            // 主要布局
            this.div.innerHTML = `
            <div class="head" id="tools-head"> 
               <span>小工具通知条</span> 
               <label class="switch" style="width:90px">
                  <input class="checkbox-input" id="checkbox" type="checkbox" checked="checked">
                  <label class="checkbox" for="checkbox"></label>
                  <span>桌面通知</span>
               </label>
               <span class="close" style="float:right; cursor:pointer; margin-right:5px;">x</span>
            </div>
            <div class="main">
               <div class="tools-notice-content"></div>
            </div>
            `;

            this.div.className = "tools-logger-panel";
            document.body.appendChild(this.div);
            this.el = this.div.querySelector(".tools-notice-content");
            (<HTMLButtonElement>this.div.querySelector(".close")).onclick = () => {
                this.el = undefined;
                this.div.remove();
            };
            let checkbox = <HTMLInputElement>this.div.querySelector("#checkbox");
            checkbox.checked = (Application.App.config.GetConfig("is_notify") || "true") == "true";
            this.is_notify = checkbox.checked;
            if (!checkbox.checked) {
                checkbox.removeAttribute("checked");
            }
            let self = this;
            checkbox.addEventListener("change", function () {
                self.is_notify = this.checked;
                Application.App.config.SetConfig("is_notify", this.checked.toString());
            });
            setTimeout(() => {
                Application.CheckUpdate((isnew, data) => {
                    if (data == undefined) {
                        this.Info("检查更新失败.");
                        return;
                    }
                    let html = "";
                    if (isnew) {
                        html += "<span>[有新版本]</span>";
                    }
                    html += data.injection;
                    this.Info(html);
                });
            }, 1000);

            //支持拖拽移动
            function getProperty(ele: HTMLElement, prop: any) {
                return parseInt(window.getComputedStyle(ele)[prop]);
            }

            this.div.style.left = Application.App.config.GetConfig("notify_tools_x");
            this.div.style.top = Application.App.config.GetConfig("notify_tools_y");
            let head = <HTMLElement>this.div.querySelector("#tools-head");
            head.onmousedown = (downEvent) => {
                let relaX = downEvent.clientX - this.div.offsetLeft;
                let relaY = downEvent.clientY - this.div.offsetTop;

                const windowWidth = window.innerWidth;
                const windowHeight = window.innerHeight;
                const containerWidth = getProperty(this.div, "width");
                const containerHeight = getProperty(this.div, "height");

                document.onmousemove = (moveEvent) => {
                    let targetX = moveEvent.clientX - relaX;
                    let targetY = moveEvent.clientY - relaY;

                    if (targetX <= 0) targetX = 0;
                    if (targetY <= 0) targetY = 0;
                    if (targetX >= windowWidth - containerWidth)
                        targetX = windowWidth - containerWidth;
                    if (targetY >= windowHeight - containerHeight)
                        targetY = windowHeight - containerHeight;

                    this.div.style.left = targetX + "px";
                    this.div.style.top = targetY + "px";
                };
                document.onmouseup = () => {
                    document.onmouseup = null;
                    document.onmousemove = null;
                    Application.App.config.SetConfig("notify_tools_x", this.div.style.left);
                    Application.App.config.SetConfig("notify_tools_y", this.div.style.top);
                };
            };
        });
    }

    protected toStr(...args: any): string {
        let text = "";
        for (let i = 0; i < args.length; i++) {
            if (typeof args[i] == "object") {
                text += JSON.stringify(args[i]) + "\n";
            } else {
                text += args[i] + "\n";
            }
        }
        return text.substring(0, text.length - 1);
    }

    public Debug(...args: any): Logger {
        console.info("[debug", this.getNowTime(), "]", ...args);
        return this;
    }

    public Info(...args: any): Logger {
        let text = this.toStr(...args);
        if (this.el) {
            this.first(text, "#409EFF", "rgba(121, 187, 255, 0.2)");
        } else {
            console.info("[info", this.getNowTime(), "]", ...args);
        }
        return this;
    }

    public Warn(...args: any): Logger {
        let text = this.toStr(...args);
        if (this.el) {
            this.first(text, "#5C3C00", "rgba(250, 236, 216, 0.4)");
        }
        console.warn("[warn", this.getNowTime(), "]", ...args);
        if (document.hidden && localStorage["is_notify"] == "true") {
            Noifications({
                title: "网课小工具",
                text: text + "\n3秒后自动关闭",
                timeout: 3000,
            });
        }
        return this;
    }

    public Error(...args: any): Logger {
        let text = this.toStr(...args);
        if (this.el) {
            this.first(text, "#FFF0F0", "rgba(253, 226, 226, 0.5)");
        }
        console.error("[error", this.getNowTime(), "]", ...args);
        if (localStorage["is_notify"] == "true") {
            Noifications({
                title: "网课小工具",
                text: text,
            });
        }
        return this;
    }

    public Fatal(...args: any): Logger {
        let text = this.toStr(...args);
        if (this.el) {
            this.first(text, "#ff0000", "rgba(253, 226, 226, 0.5)");
        }
        console.error("[fatal", this.getNowTime(), "]", ...args);
        Noifications({
            title: "网课小工具",
            text: text,
        });
        return this;
    }
}

export class EmptyLog implements Logger {
    public Debug(...args: any): Logger {
        return this;
    }

    public Info(...args: any): Logger {
        return this;
    }

    public Warn(...args: any): Logger {
        return this;
    }

    public Error(...args: any): Logger {
        return this;
    }

    public Fatal(...args: any): Logger {
        return this;
    }
}
