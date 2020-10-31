export type TaskEvent = "complete" | "init" | "stop" | "load";

export interface IEventListener<T> {
    addEventListener(event: T, callback: Function): void;
}

export class EventListener<T> implements IEventListener<T> {

    protected event: { [key: string]: Array<any> };

    constructor() {
        this.event = {};
    }


    public addEventListener(event: T, callback: Function) {
        if (!this.event[<any>event]) {
            this.event[<any>event] = new Array<any>();
        }
        this.event[<any>event].push(callback);
    }

    public callEvent(event: T) {
        if (!this.event[<any>event]) {
            return;
        }
        this.event[<any>event].forEach((v) => {
            v();
        })
    }
}

export abstract class Task extends EventListener<TaskEvent> {

    public Init(): Promise<any> {
        return new Promise<any>(resolve => {
            return resolve();
        });
    }

    public Done(): boolean {
        return false;
    }

    abstract Start(): Promise<any>;

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
}

export interface TaskControlBar {
    SetTask(task: Task): void;

    GetTask(): Task

}
