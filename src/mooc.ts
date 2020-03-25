import { RemoveInjected } from "./internal/utils/utils";
import { Application, Frontend, Launcher } from "./internal/application";
import { ChromeConfigItems, NewFrontendGetConfig } from "./internal/utils/config";
import { DefaultMoocFactory } from "./mooc/factory";
import { PageLog, Logger, ConsoleLog } from "./internal/utils/log";
import { mooc } from "./mooc/mooc";


let logger: Logger;
if (top == self) {
    logger = new PageLog();
} else {
    logger = new ConsoleLog();
}

let component = new Map<string, any>().
    set("config", new ChromeConfigItems(NewFrontendGetConfig())).
    set("logger", logger);

let app = new Application(Frontend, new mooc(new DefaultMoocFactory()), component);
app.run();

RemoveInjected(document);