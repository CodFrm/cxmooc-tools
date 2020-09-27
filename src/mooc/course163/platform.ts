import {MoocFactory, Mooc} from "../factory";
import {Course163} from "./course163";
import {Application} from "@App/internal/application";

export class Course163Platform implements MoocFactory {
    public CreateMooc(): Mooc {
        Application.App.config.topic_interval = Application.App.config.topic_interval || 0.05;
        return new Course163();
    }
}