
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

}
