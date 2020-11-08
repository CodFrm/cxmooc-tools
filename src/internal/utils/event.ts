export interface IEventListener<T> {
    // 添加事件监听
    addEventListener(event: T, callback: Function): void;

    // 添加事件监听,但是只会调用一次
    addEventListenerOnce(event: T, callback: Function): void;
}

export class EventListener<T> implements IEventListener<T> {

    protected event: { [key: string]: Array<{ callback: Function, param: { once: boolean } }> };

    constructor() {
        this.event = {};
    }


    public addEventListener(event: T, callback: Function) {
        if (!this.event[<any>event]) {
            this.event[<any>event] = new Array<any>();
        }
        this.event[<any>event].push({
            callback: callback, param: {once: false},
        });
    }


    public addEventListenerOnce(event: T, callback: Function) {
        if (!this.event[<any>event]) {
            this.event[<any>event] = new Array<any>();
        }
        this.event[<any>event].push({
            callback: callback, param: {once: true},
        });
    }

    protected callEvent(event: T, ...args: any) {
        if (!this.event[<any>event]) {
            return;
        }
        let del = new Array<number>();
        this.event[<any>event].forEach((v, index) => {
            v.callback.apply(this, args);
            if (v.param.once) {
                del.push(index);
            }
        })
        del.forEach((v, index) => {
            this.event[<any>event].splice(v - index, 1);
        });
    }
}
