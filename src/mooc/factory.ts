import { CxCourseFactory } from "./chaoxing/course";
import { CxVideoOptimizationFactory } from "./chaoxing/video";

export interface Mooc {
    Start(): void
}
export interface MoocFactory {
    CreateMooc(): Mooc
}

export function CreateMooc(): Mooc {
    let factory = PlatformChaoXing();
    if (factory != null) {
        return factory.CreateMooc();
    }
    return null
}

export function PlatformChaoXing(): MoocFactory {
    let url = document.URL;
    let factory: MoocFactory = null;
    if (url.indexOf("mycourse/studentstudy?") > 0) {
        factory = new CxCourseFactory();
    } else if (url.indexOf("ananas/modules/video/index.html") > 0) {
        factory = new CxVideoOptimizationFactory();
    }
    return factory;
}
