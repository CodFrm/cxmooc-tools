import { Mooc, MoocFactory } from "../factory";
import "../../internal/utils/hook"

export class CxCourseFactory implements MoocFactory {
    public CreateMooc(): Mooc {
        return new Course();
    }
}
export class Course implements Mooc {

    public Start(): void {

    }


}