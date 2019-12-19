import {HttpUtils} from "./internal/utils/utils";
import {Config} from "./internal/utils/config";

class popup {
    public main() {
        let cfg = document.getElementsByTagName("input");
        for (let i = 0; i < cfg.length; i++) {
            let el = cfg.item(i);
            if (el.getAttribute("config-key") != "") {
                el.onchange = function () {
                    console.log("el qwe123");
                }
            }
        }
        HttpUtils.HttpGet(Config.url, {
            json: true,
            success: (json) => {

            }, error: () => {

            }
        })
    }
}

window.onload = function () {
    new popup().main();
}
