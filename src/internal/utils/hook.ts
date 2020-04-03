import {Application} from "@App/internal/application";

export interface Context {
    (next: Function): void
}

export class Hook {
    public func: Function | string;
    public stack: Array<Context>;
    public context: any;

    public constructor(func: Function | string, context?: any) {
        this.context = context || window;
        this.func = func;
    }

    public Middleware(call: Context) {
        let name: string;
        if (typeof this.func == "string") {
            name = this.func;
        } else {
            name = this.func.name;
        }
        let old = this.context[name];
        this.context[name] = function () {
            var args = [old];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i + 1] = arguments[_i];
            }
            return call.apply(this, args);
        }
    }

    protected static once: boolean;
    protected static match_list: Map<string, (url: string, resp: string) => string>;

    public static HookAjaxRespond(url: string | Array<string>, call: (url: string, resp: string) => string) {
        if (!this.once) {
            this.match_list = new Map<string, any>();
            let self = this;
            let hookXMLHttpRequest = new Hook("open", Application.GlobalContext.XMLHttpRequest.prototype);
            hookXMLHttpRequest.Middleware(function (next: Context, ...args: any) {
                self.match_list.forEach((val, key) => {
                    if (args[1].indexOf(key) != -1) {
                        Object.defineProperty(this, "responseText", {
                            configurable: true,
                            get: function () {
                                return val.call(this, args[1], this.response)
                            }
                        });
                    }
                });
                return <XMLHttpRequest>next.apply(this, args);
            });
            this.once = true;
        }
        if (typeof url == "string") {
            this.match_list.set(url, call);
        } else {
            url.forEach((v) => {
                this.match_list.set(v, call);
            })
        }
    }
}

