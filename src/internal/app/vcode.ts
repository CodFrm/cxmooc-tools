import { HttpUtils, getImageBase64 } from "@App/internal/utils/utils";
import { Mooc } from "@App/mooc/factory";
import { CreateNoteLine } from "@App/mooc/chaoxing/utils";
import { SystemConfig } from "@App/config";
import { Application } from "../application";

export interface ListenVCode {
    Listen(callback: (fill: FillVCode) => void): void;
}
export type VCodeStatus = "ok" | "network" | "error";

export interface FillVCode {
    GetImage(): HTMLImageElement | string
    Fill(status: VCodeStatus, msg: string, code: string): void
}

export class VCode implements Mooc {

    protected mooc: Mooc;
    protected listen: ListenVCode;
    public constructor(mooc: Mooc, listen: ListenVCode) {
        this.mooc = mooc;
        this.listen = listen;
    }

    public Start(): void {
        this.mooc && this.mooc.Start();
        this.listen.Listen((fill) => {
            Application.App.log.Info("准备进行打码");
            this.getVcode(fill);
        });
    }

    protected getVcode(fill: FillVCode) {
        let img = fill.GetImage();
        let base64 = "";
        if (typeof img == "string") {
            base64 = img;
        } else {
            base64 = getImageBase64(img, 'jpeg');
        }
        HttpUtils.HttpPost(SystemConfig.url + 'vcode', 'img=' + encodeURIComponent(base64.substr('data:image/jpeg;base64,'.length)), {
            json: false,
            success: function (ret: string) {
                let json = JSON.parse(ret);
                Application.App.log.Debug(json);
                if (json.code == -2) {
                    fill.Fill("error", json.msg, "");
                } else if (json.code == -1) {
                    fill.Fill("error", "打码服务器发生错误", "");
                } else if (json.msg) {
                    fill.Fill("ok", "打码成功", json.msg);
                } else {
                    fill.Fill("error", "未知错误", "");
                }
            }, error: function () {
                fill.Fill("network", "网络请求失败", "");
            }
        });
    }

}