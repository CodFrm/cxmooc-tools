import { Course } from "./chaoxing/course";

export interface Mooc {
    Start(): void
}
export interface MoocFactory {
    CreateMooc(): Mooc
}
