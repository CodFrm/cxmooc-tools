export type TaskEvent = "complete" | "init" | "stop" | "load";
export type TaskType = "topic" | "exam" | "video" | "document" | "other";

export interface IEventListener<T> {
    addEventListener(event: T, callback: Function): void;

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

export abstract class Task extends EventListener<TaskEvent> {

    public Init(): Promise<any> {
        return new Promise<any>(resolve => {
            return resolve();
        });
    }

    public abstract Done(): boolean;

    public abstract Start(): Promise<any>;

    public abstract Type(): TaskType;

    public Submit(): Promise<void> {
        return new Promise<any>(resolve => {
            return resolve();
        });
    }

    public Stop(): Promise<void> {
        return new Promise<any>(resolve => {
            return resolve();
        });
    }

    public Context(): Window {
        return window;
    }
}

export interface TaskControlBar {
    SetTask(task: Task): void;

    GetTask(): Task

}
