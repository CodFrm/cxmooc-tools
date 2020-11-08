import {CxPlatform} from "../../mooc/chaoxing/platform";
import {ZhsPlatform} from "../../mooc/zhihuishu/platform";
import {Course163Platform} from "../../mooc/course163/platform";
import {IEventListener} from "@App/internal/utils/event";
import {Task} from "@App/internal/app/task";

// 事件
export type MoocEvent = "complete" | "reload" | "error" | "taskComplete";

// 单个Mooc任务,可能会被抛弃
export interface Mooc {
    Init(): any
}

// Mooc任务集,未来更倾向于使用此接口
export interface MoocTaskSet extends Mooc, IEventListener<MoocEvent> {
    // 初始化
    Init(): Promise<any>

    // 停止
    Stop(): Promise<any>

    // 返回下一个任务点
    Next(): Promise<Task>

    // 设置任务点位置
    SetTaskPointer(index: number): void;
}

// Mooc工厂,可以根据页面url等数据,来返回对应的mooc任务
// 未来返回值Mooc可能会换为MoocTaskSet
export interface MoocFactory {
    CreateMooc(): Mooc
}

// 默认工厂
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

