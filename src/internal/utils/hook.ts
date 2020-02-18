
export interface Context {
    (next: Function): void
}

export class Hook {
    public func: Function;
    public stack: Array<Context>;
    public context: any;

    public constructor(func: Function, context?: any) {
        this.context = context || window;
        this.func = func;
    }

    public Middleware(call: Context) {
        let old = this.context[this.func.name];
        this.context[this.func.name] = function () {
            var args = [old];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i + 1] = arguments[_i];
            }
            return call.apply(this, args);
        }
    }

}
