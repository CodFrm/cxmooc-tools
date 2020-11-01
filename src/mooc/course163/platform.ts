import {Course163} from "./course163";
import {Application} from "@App/internal/application";
import {Mooc, MoocFactory} from "@App/internal/app/mooc";

export class Course163Platform implements MoocFactory {
    public CreateMooc(): Mooc {
        if (document.URL.indexOf("www.icourse163.org") > 0) {
            Application.App.config.SetNamespace("mooc163");
            return new Course163();
        }
        return null;
    }
}