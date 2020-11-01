import {CxPlatform} from "../../mooc/chaoxing/platform";
import {ZhsPlatform} from "../../mooc/zhihuishu/platform";
import {Course163Platform} from "../../mooc/course163/platform";
import {CxCourseVCode} from "../../mooc/chaoxing/vcode";
import {Application} from "@App/internal/application";
import {IEventListener, Task} from "@App/internal/app/task";

export type MoocEvent = "complete" | "reload" | "error" | "taskComplete";

// 单个Mooc任务
export interface Mooc {
    Init(): any
}

// Mooc任务集
export interface MoocTaskSet extends Mooc, IEventListener<MoocEvent> {
    Init(): Promise<any>

    Stop(): Promise<any>

    Next(): Promise<Task>

    SetTaskPointer(index: number): void;
}

export interface MoocFactory {
    CreateMooc(): Mooc
}

export class DefaultMoocFactory implements MoocFactory {
    public CreateMooc(): Mooc {
        let mooc = new CxPlatform().CreateMooc();
        if (mooc == null) {
            mooc = new ZhsPlatform().CreateMooc();
        }
        if (mooc == null) {
            mooc = new Course163Platform().CreateMooc();
        }
        return mooc;
    }
}

