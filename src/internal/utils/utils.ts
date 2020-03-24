import { Client } from "./message";
import { AppName, Application } from "../application";
import { SystemConfig } from "@App/config";

export type RequestCallback = (body: any) => void
export type ErrorCallback = () => void

export interface RequestInfo extends RequestInit {
    url?: string
    success?: RequestCallback
    error?: ErrorCallback
    json?: boolean
}

if (window.hasOwnProperty('GM_xmlhttpRequest')) {
    //TODO:兼容油猴GM_xmlhttpRequest
    let oldGM_xmlhttpRequest = (<any>window).GM_xmlhttpRequest;
    (<any>window).GM_xmlhttpRequest = (info: RequestInfo) => {
        oldGM_xmlhttpRequest(info);
    }
} else {
    (<any>window).GM_xmlhttpRequest = (info: RequestInfo) => {
        let client: Client = Application.App.Client;
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
                body: info.body,
                headers: info.headers,
            }
        });
    }
}

export class HttpUtils {

    public static Request(info: RequestInfo): void {
        if (Application.App.IsBackend) {
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
        (<any>window).GM_xmlhttpRequest(info);
    }

    public static HttpGet(url: string, info: RequestInfo): void {
        info.url = url;
        this.Request(info)
    }

    public static HttpPost(url: string, body: any, info: RequestInfo): void {
        info.url = url;
        info.body = body;
        if (!info.headers) {
            info.headers = {};
        }
        (<any>info.headers)["Content-Type"] = "application/x-www-form-urlencoded";
        (<any>info.headers)["Authorization"] = Application.App.config.vtoken;
        (<any>info.headers)["X-Version"] = SystemConfig.version + "";
        info.method = "POST";
        this.Request(info);
    }

    public static SendRequest(client: Client, data: any) {
        if (!(data.info as RequestInfo)) {
            return
        }
        let info = <RequestInfo>data.info;
        if (Application.App.IsBackend) {
            info.success = (body) => {
                client.Send({ body: body, code: 0 })
            };
            info.error = () => {
                client.Send({ code: -1 })
            };
            HttpUtils.Request(info)
        } else {
            // content 做转发
            let extClient = Application.App.Client;
            extClient.Send({ type: "GM_xmlhttpRequest", info: info });
            extClient.Recv((data) => {
                client.Send(data)
            })
        }
    }

}


/**
 * 通过源码注入js资源
 * @param doc
 * @param url
 * @constructor
 */
export function Injected(doc: Document, source: string): Element {
    let temp = doc.createElement('script');
    temp.setAttribute('type', 'text/javascript');
    temp.innerHTML = source;
    temp.className = "injected-js";
    doc.documentElement.appendChild(temp);
    return temp;
}

export function syncGetChromeStorageLocal(key: string): Promise<any> {
    return new Promise<any>(resolve => (chrome.storage.local.get(key, (value) => {
        resolve(<any>value[<string>key]);
    })));
}

export function syncSetChromeStorageLocal(key: string, value: any): Promise<any> {
    let tmp = {};
    (<any>tmp)[key] = value;
    return new Promise<any>(resolve => (chrome.storage.local.set(tmp, () => {
        resolve();
    })));
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
    return Math.floor(Math.random() * (maxNum - minNum + 1) + minNum);
}

/**
 * 创建一个按钮
 * @param title 
 * @param description 
 * @param id 
 */
export function createBtn(title: string, description: string = "", className: string = "", id: string = ""): HTMLButtonElement {
    let btn = document.createElement('button');
    btn.innerText = title;
    btn.id = id;
    btn.title = description;
    btn.className = className;
    return btn;
}

/**
 * get请求
 * @param {*} url 
 */
export function get(url: string, success: Function) {
    let xmlhttp = createRequest();
    xmlhttp.open("GET", url, true);
    xmlhttp.send();

    xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (this.status == 200) {
                success && success(this.responseText, (<any>this).resource);
            } else {
                (<any>xmlhttp).errorCallback && (<any>xmlhttp).errorCallback(this);
            }
        }
    }
    return xmlhttp;
}

/**
 * post请求
 * @param {*} url 
 * @param {*} data 
 * @param {*} json 
 */
export function post(url: string, data: any, json = true, success: Function) {
    let xmlhttp = createRequest();
    xmlhttp.open("POST", url, true);
    xmlhttp.setRequestHeader('Authorization', Application.App.config.vtoken || '');
    if (json) {
        xmlhttp.setRequestHeader("Content-Type", "application/json");
    } else {
        xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    }
    xmlhttp.send(data);

    xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (this.status == 200) {
                success && success(this.responseText);
            } else {
                (<any>xmlhttp).errorCallback && (<any>xmlhttp).errorCallback(this);
            }
        }
    }
    return xmlhttp;
}

declare namespace Express {
    interface XMLHttpRequest {
        error: any; // 不要用 any.
    }
}
/**
 * 创建http请求
 */
function createRequest(): XMLHttpRequest {
    let xmlhttp: XMLHttpRequest;
    if (window.XMLHttpRequest) {
        xmlhttp = new XMLHttpRequest();
    } else {
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    (<any>xmlhttp).error = function (callback: Function) {
        (<any>xmlhttp).errorCallback = callback;
        return xmlhttp;
    }
    xmlhttp.withCredentials = true;
    return xmlhttp;
}

/**
 * 去除html标签和处理中文
 * @param {string} html 
 */
export function removeHTML(html: string) {
    //先处理带src和href属性的标签
    let srcReplace = /<img.*?src="(.*?)".*?>/g;
    html = html.replace(srcReplace, '$1');
    srcReplace = /(<iframe.+?>)\s+?(<\/iframe>)/g;
    html = html.replace(srcReplace, '$1$2');
    srcReplace = /<(iframe|a).*?(src|href)="(.*?)".*?>(.*?)<\/(iframe|a)>/g;
    html = html.replace(srcReplace, '$3$4');
    let revHtml = /<.*?>/g;
    html = html.replace(revHtml, '');
    html = html.replace(/(^\s+)|(\s+$)/g, '');
    html = dealSymbol(html);
    return html.replace(/&nbsp;/g, ' ').trim();
}

/**
 * 处理符号
 * @param topic 
 */
function dealSymbol(topic: string) {
    topic = topic.replace(/，/g, ',');
    topic = topic.replace(/（/g, '(');
    topic = topic.replace(/）/g, ')');
    topic = topic.replace(/？/g, '?');
    topic = topic.replace(/：/g, ':');
    topic = topic.replace(/。/g, '.');
    topic = topic.replace(/[“”]/g, '"');
    return topic;
}

/**
 * 取中间文本
 * @param str 
 * @param left 
 * @param right 
 */
export function substrex(str: string, left: string, right: string) {
    var leftPos = str.indexOf(left) + left.length;
    var rightPos = str.indexOf(right, leftPos);
    return str.substring(leftPos, rightPos);
}

export function dealHotVersion(hotversion: string): number {
    hotversion = hotversion.substring(0, hotversion.indexOf(".") + 1) + hotversion.substring(hotversion.indexOf(".") + 1).replace(".", "");
    return Number(hotversion);
}

export function protocolPrompt(content: string, key: string, keyword?: string): boolean {
    keyword = keyword || "yes";
    if (localStorage[key] == undefined || localStorage[key] != 1) {
        let msg = prompt(content + "\n如果以后不想再弹出本对话框并且同意请在下方填写\"" + keyword + "\"");
        if (msg === null) return false;
        if (keyword != msg) {
            return false;
        }
        localStorage[key] = 1;
    }
    return true;
}

export function getImageBase64(img: HTMLImageElement, ext: string) {
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, img.width, img.height);
    var dataURL = canvas.toDataURL("image/" + ext, 0.75);//节省可怜的流量>_<,虽然好像没有啥
    canvas = null;
    return dataURL;
}
