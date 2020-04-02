export type TaskEvent = "complete" | "init" | "stop" | "load";

export abstract class Task {

    protected event: { [key: string]: Array<any> };

    constructor() {
        this.event = {};
    }

    public addEventListener(event: TaskEvent, callback: Function) {
        if (!this.event[event]) {
            this.event[event] = new Array<any>();
        }
        this.event[event].push(callback);
    }

    public callEvent(event: TaskEvent) {
        if (!this.event[event]) {
            return;
        }
        this.event[event].forEach((v) => {
            v();
        })
    }

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
