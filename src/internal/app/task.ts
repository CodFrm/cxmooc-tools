import {EventListener} from "@App/internal/utils/event";

export type TaskEvent = "complete" | "init" | "stop" | "load";
export type TaskType = "topic" | "exam" | "video" | "document" | "other";

export abstract class Task extends EventListener<TaskEvent> {
    // 初始化任务
    public Init(): Promise<any> {
        return new Promise<any>(resolve => {
            return resolve();
        });
    }

    // 任务是否完成
    public abstract Done(): boolean;

    // 任务开始
    public abstract Start(): Promise<any>;

    // 任务类型
    public abstract Type(): TaskType;

    // 提交任务,例如topic的类型,可以在本接口内进行提交操作
    public Submit(): Promise<void> {
        return new Promise<any>(resolve => {
            return resolve();
        });
    }

    // 停止任务
    public Stop(): Promise<void> {
        return new Promise<any>(resolve => {
            return resolve();
        });
    }

    // 任务的上下文(对于某些iframe的可能会用到)
    public Context(): Window {
        return window;
    }
}

export interface TaskControlBar {
    SetTask(task: Task): void;

    GetTask(): Task

}
