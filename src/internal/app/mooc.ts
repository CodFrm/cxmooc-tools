import {CxPlatform} from "../../mooc/chaoxing/platform";
import {ZhsPlatform} from "../../mooc/zhihuishu/platform";
import {Course163Platform} from "../../mooc/course163/platform";
import {CxCourseVCode} from "../../mooc/chaoxing/vcode";
import {Application} from "@App/internal/application";
import {IEventListener} from "@App/internal/app/task";

export type MoocEvent = "complete" | "init" | "stop" | "load";

export interface Mooc {
    Init(): any

    // TODO: 实现各种流程流转
    // Start()
    // Stop()
    // OnFinished()
    // Next()
}

export interface MoocTaskSet extends Mooc, IEventListener<MoocEvent> {
    Init(): Promise<any>

    Start(): Promise<any>

    Stop(): Promise<any>

    Next(): Promise<any>
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

