import {MoocFactory, Mooc} from "../factory";
import {Course163} from "./course163";
import {Application} from "@App/internal/application";

export class Course163Platform implements MoocFactory {
    public CreateMooc(): Mooc {
        let url = document.URL;
        let mooc: Mooc;
        if (url.indexOf("www.icourse163.org") > 0) {
            mooc = new Course163();
        }
        if (mooc) {
            Application.App.config.SetNamespace("mooc163");
        }
        return mooc;
    }
}