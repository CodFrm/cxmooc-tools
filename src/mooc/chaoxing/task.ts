
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
        this.taskinfo = taskinfo;
        this.context = context;
    }

    public Complete(callback: () => void): void {
        this.completeCallback = callback;
    }

    public Init(): void {

    }

    public Load(callback: () => void): void {
        this.loadCallback = callback;
    }
    public abstract Start(): void
}
