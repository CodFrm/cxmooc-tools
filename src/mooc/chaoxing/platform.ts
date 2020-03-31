import {MoocFactory, Mooc} from "../factory";
import {VCode} from "@App/internal/app/vcode";
import {CxCourse, CxHomeWork, CxExamTopic} from "./course";
import {CxCourseVCode} from "./vcode";
import {CxVideoOptimization} from "./video";
import {Read, ReadStartPage} from "@App/mooc/chaoxing/read";

export class CxPlatform implements MoocFactory {
    public CreateMooc(): Mooc {
        let url = document.URL;
        let mooc: Mooc = null;
        if (url.indexOf("mycourse/studentstudy?") > 0) {
            mooc = new VCode(new CxCourse(), new CxCourseVCode());
        } else if (url.indexOf("ananas/modules/video/index.html") > 0) {
            mooc = new CxVideoOptimization();
        } else if ((url.indexOf("work/doHomeWorkNew") > 0 || url.indexOf("work/selectWorkQuestionYiPiYue") > 0) && self == top) {
            mooc = new CxHomeWork();
        } else if (url.indexOf("exam/test/reVersionTestStartNew") > 0 || url.indexOf("exam/test/reVersionPaperMarkContentNew") > 0) {
            mooc = new CxExamTopic();
        } else if (url.indexOf("/course/") > 0) {
            mooc = new ReadStartPage();
        } else if (url.indexOf("ztnodedetailcontroller/visitnodedetail") > 0) {
            mooc = new Read();
        }
        return mooc;
    }
}
