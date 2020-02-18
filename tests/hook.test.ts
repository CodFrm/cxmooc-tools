import { Hook } from "@App/internal/utils/hook";

function hookContext() {
    return {
        add: function (a: number, b: number) {
            return a + b;
        }
    };
}

describe("hook", () => {
    it("测试hook一次", () => {
        let context = hookContext();

        let hook = new Hook(context.add, context);

        hook.Middleware(function (next: Function, ...args: any) {
            return next.apply(this, args) + 1;
        });

        expect(context.add(1, 1)).toBe(3);
    });
    it("测试hook两次", () => {
        let context = hookContext();
        let hook = new Hook(context.add, context);
        hook.Middleware(function (next: Function, ...args: any) {
            return next.apply(this, args) + 1;
        });
        hook.Middleware(function (next: Function, ...args: any) {
            return next.apply(this, args) + 1;
        });
        expect(context.add(1, 1)).toBe(4);
    });
    it("拦截测试", () => {
        let context = hookContext();
        let hook = new Hook(context.add, context);
        hook.Middleware(function (next: Function, ...args: any) {
            return 0;
        });
        expect(context.add(1, 1)).toBe(0);
    });
});