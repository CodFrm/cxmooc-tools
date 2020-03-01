import { RemoveInjected, HttpUtils } from "./internal/utils/utils";
import { Application, Frontend, Launcher } from "./internal/application";
import { ChromeConfigItems, NewFrontendGetConfig, SystemConfig } from "./internal/utils/config";
import { CreateMooc } from "./mooc/factory";
import { ConsoleLog, EmptyLog } from "./internal/utils/log";

RemoveInjected(document);

class mooc implements Launcher {
    public start() {
        let state = document.readyState;
        Application.App.log.Debug("State:", state);
        let mooc = CreateMooc();
        if (mooc != null) {
            mooc.Start();
        }
    }
}

let component = new Map<string, any>().
    set("config", new ChromeConfigItems(NewFrontendGetConfig())).
    set("logger", new ConsoleLog());

let app = new Application(Frontend, new mooc(), component);
app.run()
