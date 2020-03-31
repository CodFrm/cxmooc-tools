import {Task} from "@App/mooc/chaoxing/task";
import {Application} from "@App/internal/application";
import {randNumber} from "@App/internal/utils/utils";


export class CxDocumentTask extends Task {
    protected time: NodeJS.Timer;

    public Start(): void {
        let next = () => {
            let el = this.context.document.querySelector(".imglook > .mkeRbtn");
            if (el.style.visibility == "hidden") {
                this.completeCallback && this.completeCallback();
                return;
            }
            el.click();
            this.time = this.context.setTimeout(next, randNumber(1, 5) * 1000);
        };
        this.time = this.context.setTimeout(next, randNumber(1, 5) * 1000);
    }
}