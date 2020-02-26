import { RemoveInjected } from "./internal/utils/utils";
import { Application, Frontend, Launcher } from "./internal/application";
import { ChromeConfigItems, NewFrontendGetConfig } from "./internal/utils/config";
import { CreateMooc } from "./mooc/factory";
import { ConsoleLog, EmptyLog } from "./internal/utils/log";

RemoveInjected(document);

class mooc implements Launcher {
    async start(): Promise<void> {
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
