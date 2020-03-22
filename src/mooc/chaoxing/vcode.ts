import { ListenVCode, FillVCode, VCodeStatus } from "@App/internal/app/vcode";
import { CreateNoteLine } from "./utils";

export class CourseVCode implements ListenVCode {

    public Listen(callback: (fill: FillVCode) => void): void {
        let imgel: HTMLImageElement;
        if (imgel = <HTMLImageElement>document.getElementById("imgVerCode")) {
            imgel.addEventListener("load", () => {
                if (imgel.getAttribute("src").indexOf('?') < 0) {
                    return;
                }
                let parent = document.querySelector('#sub').parentElement.parentElement;
                let old = parent.querySelector(".prompt-line-dama");
                if (old) {
                    old.remove();
                }
                let notice = CreateNoteLine('cxmooc自动打码中...', 'dama', parent);
                callback(new CxCourseFillVCode(imgel, notice));
            });
        }
    }
}

class CxCourseFillVCode implements FillVCode {
    protected img: HTMLImageElement;
    protected notice: HTMLElement;
    constructor(img: HTMLImageElement, notice: HTMLElement) {
        this.img = img;
        this.notice = notice;
    }

    public GetImage(): string | HTMLImageElement {
        return this.img;
    }

    public Fill(status: VCodeStatus, msg: string, code: string): void {
        switch (status) {
            case "ok": {
                this.notice.innerText = "cxmooc打码成功,准备提交";
                (<HTMLInputElement>document.querySelector('input#code')).value = code;
                setTimeout(function () {
                    (<HTMLLinkElement>document.querySelector('a#sub')).click();
                }, 3000);
                break;
            } default: {
                alert(msg);
                this.notice.innerText = msg;
            }
        }
    }

}