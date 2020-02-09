import { Client } from "./message";
import { AppName, Application } from "../application";

export type RequestCallback = (body: any) => void
export type ErrorCallback = () => void

export interface RequestInfo extends RequestInit {
    url?: string
    success?: RequestCallback
    error?: ErrorCallback
    json?: boolean
}

export class HttpUtils {

    public static Request(info: RequestInfo): void {
        if (Application.App().IsBackend) {
            fetch(info.url, info).then(body => {
                if (info.json) {
                    return body.json();
                } else {
                    return body.text();
                }
            }).then(body => {
                info.success && info.success(body)
            }).catch(() => {
                info.error && info.error()
            });
            return;
        }
        HttpUtils.crossDomainRequest(info)
    }

    private static crossDomainRequest(info: RequestInfo): void {
        if (window.hasOwnProperty('GM_xmlhttpRequest')) {
            let oldGM_xmlhttpRequest = (<any>window).GM_xmlhttpRequest;
            (<any>window).GM_xmlhttpRequest = (info: RequestInfo) => {
                oldGM_xmlhttpRequest(info);
            }
        } else {
            (<any>window).GM_xmlhttpRequest = (info: RequestInfo) => {
                let client: Client = Application.App().Client;
                client.Recv((data) => {
                    if (data.code == 0) {
                        info.success && info.success(data.body);
                    } else {
                        info.error && info.error();
                    }
                });
                client.Send({
                    type: "GM_xmlhttpRequest", info: {
                        url: info.url,
                        method: info.method,
                        json: info.json,
                    }
                });
            }
        }
        (<any>window).GM_xmlhttpRequest(info);
    }

    public static HttpGet(url: string, info: RequestInfo): void {
        info.url = url;
        this.Request(info)
    }

    public static HttpPost(url: string, body: any, info: RequestInfo): void {
        info.url = url;
        info.body = body;
        this.Request(info)
    }

    public static SendRequest(client: Client, data: any) {
        if (!(data.info as RequestInfo)) {
            return
        }
        let info = <RequestInfo>data.info;
        if (Application.App().IsBackend) {
            info.success = (body) => {
                client.Send({ body: body, code: 0 })
            };
            info.error = () => {
                client.Send({ code: -1 })
            };
            HttpUtils.Request(info)
        } else {
            // content 做转发
            let extClient = Application.App().Client;
            extClient.Send({ type: "GM_xmlhttpRequest", info: info });
            extClient.Recv((data) => {
                client.Send(data)
            })
        }
    }

}


/**
 * 注入js资源
 * @param doc
 * @param url
 * @constructor
 */
export function Injected(doc: Document, url: string): Element {
    let temp = doc.createElement('script');
    temp.setAttribute('type', 'text/javascript');
    temp.src = url;
    temp.className = "injected-js";
    doc.documentElement.appendChild(temp);
    return temp;
}

/**
 * 移除注入js
 * @param doc
 */
export function RemoveInjected(doc: Document) {
    let resource = doc.getElementsByClassName("injected-js");
    for (let i = 0; i < resource.length; i++) {
        resource[i].remove();
    }
}

export function randNumber(minNum: number, maxNum: number): number {
    switch (arguments.length) {
        case 1:
            return Math.ceil(Math.random() * minNum + 1);
        case 2:
            return Math.ceil(Math.random() * (maxNum - minNum + 1) + minNum);
        default:
            return 0;
    }
}