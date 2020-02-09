import { NewExtensionServerMessage } from "./internal/utils/message";
import { HttpUtils } from "./internal/utils/utils";
import { Application, Backend } from "./internal/application";

new Application(Backend);
class background {

    public main() {
        let server = NewExtensionServerMessage("cxmooc-tools");
        server.Accept((client, data) => {
            switch (data.type) {
                case "GM_xmlhttpRequest": {
                    HttpUtils.SendRequest(client, data);
                    break;
                }
            }
        });
        Application.CheckUpdate(function (isnew, data) {
            if (isnew) {
                chrome.browserAction.setBadgeText({
                    text: 'new'
                });
                chrome.browserAction.setBadgeBackgroundColor({
                    color: [255, 0, 0, 255]
                });
            }
        });
    }
}

new background().main();
