import { CxPlatform } from "./chaoxing/platform";
import { ZhsPlatform } from "./zhihuishu/platform";
import { Course163Platform } from "./course163/platform";

export interface Mooc {
    Start(): void
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

