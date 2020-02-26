import { Application } from "../application";

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