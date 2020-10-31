import {VCode} from "@App/internal/app/vcode";
import {CxCourse, CxHomeWork, CxExamTopic} from "./course";
import {CxCourseVCode} from "./vcode";
import {CxVideoOptimization} from "./video";
import {Exam, Read, ReadStartPage} from "@App/mooc/chaoxing/read";
import {CxAudioOptimization} from "@App/mooc/chaoxing/special";
import {Application} from "@App/internal/application";
import {Mooc, MoocFactory} from "@App/internal/app/mooc";

export class CxPlatform implements MoocFactory {
    public CreateMooc(): Mooc {
        let url = document.URL;
        let mooc: Mooc = null;
        if (url.indexOf("mycourse/studentstudy?") > 0) {
            new VCode(new CxCourseVCode());//添加打码组件
            mooc = new CxCourse();
        } else if (url.indexOf("ananas/modules/video/index.html") > 0) {
            mooc = new CxVideoOptimization();
        } else if (url.indexOf("ananas/modules/audio/index.html") > 0) {
            mooc = new CxAudioOptimization();
        } else if ((url.indexOf("work/doHomeWorkNew") > 0 || url.indexOf("work/selectWorkQuestionYiPiYue") > 0) && self == top) {
            mooc = new CxHomeWork();
        } else if (url.indexOf("exam/test/reVersionTestStartNew") > 0 || url.indexOf("exam/test/reVersionPaperMarkContentNew") > 0) {
            mooc = new CxExamTopic();
        } else if (url.indexOf("/course/") > 0) {
            mooc = new ReadStartPage();
        } else if (url.indexOf("ztnodedetailcontroller/visitnodedetail") > 0) {
            mooc = new Read();
        } else if (url.indexOf("exam/test?") > 0) {
            mooc = new Exam();
        }
        if (mooc) {
            Application.App.config.SetNamespace("cx");
        }
        return mooc;
    }
}
