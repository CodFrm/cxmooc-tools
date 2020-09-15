import {MoocFactory, Mooc} from "../factory";
import {ZhsVideo} from "./video";
import {ZhsExam} from "./exam";
import {Application} from "@App/internal/application";

export class ZhsPlatform implements MoocFactory {
    public CreateMooc(): Mooc {
        Application.App.config.topic_interval = Application.App.config.topic_interval || 0;
        let mooc: Mooc = null;
        if (document.URL.indexOf("studyh5.zhihuishu.com/videoStudy.html") > 0) {
            mooc = new ZhsVideo();
        } else if (document.URL.indexOf("zhihuishu.com/stuExamWeb.html") > 0) {
            mooc = new ZhsExam();
        }
        if (mooc) {
            Application.App.config.SetNamespace("zhs");
        }
        return mooc;
    }
}
