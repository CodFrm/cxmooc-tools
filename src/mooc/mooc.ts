import { Launcher, Application } from "@App/internal/application";
import { MoocFactory } from "./factory";

export class mooc implements Launcher {
    protected moocFactory: MoocFactory;
    constructor(moocFactory: MoocFactory) {
        this.moocFactory = moocFactory;
    }
    public start() {
        let state = document.readyState;
        Application.App.log.Debug("Start document state:", state);
        let mooc = this.moocFactory.CreateMooc();
        if (mooc != null) {
            mooc.Start();
        }
    }
}