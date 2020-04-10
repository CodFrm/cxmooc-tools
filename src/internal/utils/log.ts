import {
    Application
} from "../application";
import "../../views/common";
import {
    Noifications
} from "@App/internal/utils/utils";

export interface Logger {
    Debug(...args: any): Logger;

    Info(...args: any): Logger;

    Warn(...args: any): Logger;

    Error(...args: any): Logger;

    Fatal(...args: any): Logger;
}

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

    protected getNowTime(): string {
        let time = new Date();
        return time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds();
    }

    first(text: string, color: string, background: string) {
        let new_log = document.createElement("div");
        new_log.innerHTML = `
                <div class="log" style="border-color: ` + background + `; background-color: ` + background + `;">
                    <p><span style="color:` + color + `;">` + text + `</span></p>
                </div>
            `;
        //插入第一个元素前
        var first = document.getElementsByClassName("tools-notice-content")[0].getElementsByTagName("div");
        document.querySelector(".tools-notice-content").insertBefore(new_log, first[0]);
    }

    constructor() {
        this.el = undefined;
        window.addEventListener("load", () => {
            let div = document.createElement("div");
            // 主要布局
            div.innerHTML = `
            <div class="head"> 
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

            div.className = "tools-logger-panel";
            document.body.appendChild(div);
            this.el = div.querySelector(".tools-notice-content");
            ( < HTMLButtonElement > div.querySelector(".close")).onclick = () => {
                this.el = undefined;
                div.remove();
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
        // 判断选中状态是否发送桌面通知
        if (this.el && ( < HTMLInputElement > this.el.querySelector('#checkbox')).checked) {
            var s1 = new PageLog();
            s1.first(text, "#409EFF", "rgba(121, 187, 255, 0.2)");
        } else {
            console.info("[info", this.getNowTime(), "]", ...args);
        }
        return this;
    }


    public Warn(...args: any): Logger {
        console.warn("[warn", this.getNowTime(), "]", ...args);
        let text = this.toStr(...args);
        if (this.el) {
            var s1 = new PageLog();
            s1.first(text, "#5C3C00", "rgba(250, 236, 216, 0.4)");
        }
        if (document.hidden && ( < HTMLInputElement > this.el.querySelector('#checkbox')).checked) {
            Noifications({
                title: "超星慕课小工具",
                text: text + "\n3秒后自动关闭",
                timeout: 3000,
            });
        }
        return this;
    }

    public Error(...args: any): Logger {
        console.error("[error", this.getNowTime(), "]", ...args);
        let text = this.toStr(...args);
        if (this.el && ( < HTMLInputElement > this.el.querySelector('#checkbox')).checked) {
            var s1 = new PageLog();
            s1.first(text, "#FFF0F0", "rgba(253, 226, 226, 0.5)");
        }
        if (document.hidden && ( < HTMLInputElement > this.el.querySelector('#checkbox')).checked) {
            Noifications({
                title: "超星慕课小工具",
                text: text,
            });
        }
        return this;
    }

    public Fatal(...args: any): Logger {
        console.error("[fatal", this.getNowTime(), "]", ...args);
        let text = this.toStr(...args);
        this.el.innerHTML = text;
        if (document.hidden && ( < HTMLInputElement > this.el.querySelector('#checkbox')).checked) {
            Noifications({
                title: "超星慕课小工具",
                text: text,
            });
        }
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