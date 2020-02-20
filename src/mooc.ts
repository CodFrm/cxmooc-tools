import { RemoveInjected } from "./internal/utils/utils";
import { Application, Frontend, Launcher } from "./internal/application";
import { ChromeConfigItems, NewFrontendGetConfig } from "./internal/utils/config";
import { Mooc, MoocFactory } from "./mooc/factory";
import { CxCourseFactory } from "./mooc/chaoxing/course";

RemoveInjected(document);

class mooc implements Launcher {
    async start(): Promise<void> {
        let url = document.URL;
        let factory: MoocFactory;
        let mooc: Mooc;
        if (url.indexOf("mycourse/studentstudy?") > 0) {
            factory = new CxCourseFactory();
        }
        mooc = factory.CreateMooc();
        mooc.Start();
    }
}

let component = new Map<string, any>().
    set("config", new ChromeConfigItems(NewFrontendGetConfig()));

let app = new Application(Frontend, new mooc(), component);
app.run()
