
export interface TaskFactory {
    CreateTask(context: any, taskinfo: any): Task;
}

export abstract class Task {
    public jobIndex: number;
    protected taskinfo: any;
    protected context: any;
    protected completeCallback: () => void;
    protected loadCallback: () => void;

    public constructor(context: any, taskinfo: any) {
        this.Init(context, taskinfo);
    }

    public Complete(callback: () => void): void {
        this.completeCallback = callback;
    }

    public Init(context: any, taskinfo: any): void {
        this.taskinfo = taskinfo;
        this.context = context;
    }
    public Load(callback: () => void): void {
        this.loadCallback = callback;
    }
    public abstract Start(): void
}

export class TopicFactory implements TaskFactory {
    CreateTask(context: any, taskinfo: any): Task {
        throw new Error("Method not implemented.");
    }
}

export class Topic extends Task {
    public Start(): void {
        throw new Error("Method not implemented.");
    }
}
