import { RemoveInjected } from "./internal/utils/utils";
import { Application, Frontend, Launcher } from "./internal/application";
import { ChromeConfigItems, NewFrontendGetConfig } from "./internal/utils/config";
import { CreateMooc } from "./mooc/factory";
import { ConsoleLog } from "./internal/utils/log";
import { ToolsQuestionBankFacad, ToolsQuestionBank } from "./internal/utils/question";

class mooc implements Launcher {
    public start() {
        let state = document.readyState;
        Application.App.log.Debug("Start document state:", state);
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

RemoveInjected(document);