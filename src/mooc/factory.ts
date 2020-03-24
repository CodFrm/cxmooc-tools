import { CxCourse, CxHomeWork, CxExamTopic } from "./chaoxing/course";
import { CxVideoOptimization } from "./chaoxing/video";
import { ZhsVideo } from "./zhihuishu/video";
import { ZhsExam } from "./zhihuishu/exam";
import { VCode } from "@App/internal/app/vcode";
import { CourseVCode as CxCourseVCode } from "./chaoxing/vcode";
import { Course163 } from "./course163/course163";

export interface Mooc {
    Start(): void
}
export interface MoocFactory {
    CreateMooc(): Mooc
}

export function CreateMooc(): Mooc {
    let mooc = PlatformChaoXing();
    if (mooc == null) {
        mooc = PlatformZhihuishu();
    }
    if (mooc == null) {
        mooc = PlatformCourse163();
    }
    return mooc;
}

export function PlatformChaoXing(): Mooc {
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
    }
    return mooc;
}

export function PlatformZhihuishu(): Mooc {
    let mooc: Mooc = null;
    if (document.URL.indexOf("studyh5.zhihuishu.com/videoStudy.html") > 0) {
        mooc = new ZhsVideo();
    } else if (document.URL.indexOf("zhihuishu.com/stuExamWeb.html") > 0) {
        mooc = new ZhsExam();
    }
    return mooc;
}

export function PlatformCourse163(): Mooc {
    return new Course163();
}
