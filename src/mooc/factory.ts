import { Course } from "./chaoxing/course";

export interface Mooc {
    Start(): void
}
export class MoocFactory {
    public static CreateMooc(url: string): Mooc {
        if (url.indexOf("mycourse/studentstudy?") > 0) {
            return new Course();
        }
        throw new Error("No corresponding factory");
    }
}
