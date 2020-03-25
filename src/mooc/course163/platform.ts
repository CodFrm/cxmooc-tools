import { MoocFactory, Mooc } from "../factory";
import { Course163 } from "./course163";

export class Course163Platform implements MoocFactory {
    public CreateMooc(): Mooc {
        return new Course163();
    }
}