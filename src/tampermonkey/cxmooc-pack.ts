import { PlatformChaoXing } from "@App/mooc/factory";
import { Launcher, Application, Frontend } from "@App/internal/application";
import { ChromeConfigItems, NewFrontendGetConfig } from "@App/internal/utils/config";
import { ConsoleLog } from "@App/internal/utils/log";
import { RemoveInjected } from "@App/internal/utils/utils";

class mooc implements Launcher {
    public start() {
        let state = document.readyState;
        Application.App.log.Debug("Start document state:", state);
        let mooc = PlatformChaoXing();
        if (mooc != null) {
            mooc.Start();
        }
    }
}

let component = new Map<string, any>().
    set("config", new ChromeConfigItems(NewFrontendGetConfig())).
    set("logger", new ConsoleLog());

let app = new Application(Frontend, new mooc(), component);
app.run();

RemoveInjected(document);
