import {Mooc} from "../factory";
import {Application} from "@App/internal/application";
import {randNumber} from "@App/internal/utils/utils";

export class Read implements Mooc {

    public Start(): void {
        let timer: NodeJS.Timer;
        let slide = function () {
            if ((<any>window).getScrollHeight() - (<any>window).getHeight() <= (<any>window).getScrollTop() + 40) {
                let next = document.querySelectorAll('.mb15.course_section > a.wh.wh');
                let flag = false;
                for (let i = 0; i < next.length; i++) {
                    if (flag) {
                        (<HTMLLinkElement>next[i]).click();
                        return;
                    }
                    if (document.URL == (<HTMLLinkElement>next[i]).href) {
                        flag = true;
                    }
                }
                Application.App.log.Warn("阅读完成啦~");
                clearTimeout(timer);
                return;
            }
            window.scrollTo(0, (<any>window).getScrollTop() + randNumber(60, 80));
            timer = setTimeout(slide, randNumber(10, 20) * 500);
        };
        window.addEventListener("load", () => {
            slide();
        });
    }

}

export class ReadStartPage implements Mooc {
    public Start(): void {
        window.addEventListener("load", () => {
            if (!Application.App.config.auto) {
                return Application.App.log.Info("开启自动挂机能够自动阅读文章哦");
            }
            Application.App.log.Info("请在10秒内选择章节,否则插件将从第一章自动开始");
            setTimeout(() => {
                let el = document.querySelector(".mb15.course_section.fix");
                el.querySelector("a").click();
            }, 10000);
        });
    }
}