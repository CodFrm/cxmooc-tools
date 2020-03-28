import {Application} from "../application";
import "../../views/common";

export interface Logger {
    Trace(...args: any): Logger;

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

    public Trace(...args: any): Logger {
        Application.App.debug && console.trace("[trace", this.getNowTime(), "]", ...args);
        return this;
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

    constructor() {
        this.el = undefined;
        window.addEventListener("load", () => {
            let div = document.createElement("div");
            div.innerHTML = '小工具通知条<button class="close">关闭</button><div class="tools-notice-content">';
            div.className = "tools-logger-panel";
            document.body.appendChild(div);
            this.el = div.querySelector(".tools-notice-content");
            (<HTMLButtonElement>div.querySelector("button.close")).onclick = () => {
                this.el = undefined;
                div.remove();
            };
        });
    }

    public Trace(...args: any): Logger {
        console.trace("[trace", this.getNowTime(), "]", ...args);
        return this;
    }

    public Debug(...args: any): Logger {
        console.info("[debug", this.getNowTime(), "]", ...args);
        return this;
    }

    public Info(...args: any): Logger {
        let text = "";
        for (let i = 0; i < args.length; i++) {
            if (typeof args[i] == "object") {
                text += JSON.stringify(args[i]) + "\n";
            } else {
                text += args[i] + "\n";
            }
        }
        if (this.el) {
            this.el.innerHTML = text
        } else {
            console.info("[info", this.getNowTime(), "]", ...args);
        }
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

export class EmptyLog implements Logger {
    Trace(...args: any): Logger {
        return this;
    }

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