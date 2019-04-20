/**
 * 注入js资源
 * @param doc 
 * @param file 
 */
export function injected(doc, url) {
    let temp = doc.createElement('script');
    temp.setAttribute('type', 'text/javascript');
    temp.src = url;
    temp.className = "injected-js";
    doc.documentElement.appendChild(temp);
    return temp;
}

/**
 * 移除注入js
 */
export function removeinjected(doc) {
    let resource = doc.getElementsByClassName("injected-js");
    for (let i = 0; i < resource.length; i++) {
        resource[i].remove();
    }
}

/**
 * get请求
 * @param {*} url 
 */
export function get(url, success) {
    let xmlhttp = createRequest();
    xmlhttp.open("GET", url, true);
    xmlhttp.send();

    xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (this.status == 200) {
                success && success(this.responseText, this.resource);
            } else {
                xmlhttp.errorCallback && xmlhttp.errorCallback(this);
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
export function post(url, data, json = true, success) {
    let xmlhttp = createRequest();
    xmlhttp.open("POST", url, true);
    xmlhttp.setRequestHeader('Authorization', config.vtoken || '');
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
                xmlhttp.errorCallback && xmlhttp.errorCallback(this);
            }
        }
    }
    return xmlhttp;
}

/**
 * 去除html标签和处理中文
 * @param {string} html 
 */
export function removeHTML(html) {
    //先处理img标签
    var imgReplace = /<img .*?src="(.*?)".*?>/g;
    html = html.replace(imgReplace, '$1');
    var revHtml = /<.*?>/g;
    html = html.replace(revHtml, '');
    html = html.replace(/(^\s+)|(\s+$)/g, '');
    html = dealSymbol(html);
    return html.replace(/&nbsp;/g, ' ');
}

/**
 * 处理符号
 * @param {*} topic 
 */
function dealSymbol(topic) {
    topic = topic.replace('，', ',');
    topic = topic.replace('（', '(');
    topic = topic.replace('）', ')');
    topic = topic.replace('？', '?');
    topic = topic.replace('：', ':');
    topic = topic.replace(/[“”]/g, '"');
    return topic;
}

/**
 * 取中间文本
 * @param {*} str 
 * @param {*} left 
 * @param {*} right 
 */
export function substrEx(str, left, right) {
    var leftPos = str.indexOf(left) + left.length;
    var rightPos = str.indexOf(right, leftPos);
    return str.substring(leftPos, rightPos);
}

/**
 * 创建http请求
 */
function createRequest() {
    var xmlhttp;
    if (window.XMLHttpRequest) {
        xmlhttp = new XMLHttpRequest();
    } else {
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.error = function (callback) {
        xmlhttp.errorCallback = callback;
        return xmlhttp;
    }
    return xmlhttp;
}

export function randNumber(minNum, maxNum) {
    switch (arguments.length) {
        case 1:
            return parseInt(Math.random() * minNum + 1, 10);
        case 2:
            return parseInt(Math.random() * (maxNum - minNum + 1) + minNum, 10);
        default:
            return 0;
    }
}

Date.prototype.format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1, //月份 
        "d+": this.getDate(), //日 
        "h+": this.getHours(), //小时 
        "m+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

export function log(msg) {
    console.log("cxmooc-tools [" + (new Date()).format("yyyy-MM-dd hh:mm:ss") + "] " + msg)
}

export function getImageBase64(img, ext) {
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, img.width, img.height);
    var dataURL = canvas.toDataURL("image/" + ext, 0.75);//节省可怜的流量>_<,虽然好像没有啥
    canvas = null;
    return dataURL;
}

export function boom_btn() {
    if (localStorage['boom_no_prompt'] == undefined || localStorage['boom_no_prompt'] != 1) {
        let msg = prompt('秒过视频会产生不良记录,是否继续?如果以后不想再弹出本对话框请在下方填写yes')
        if (msg === null) return false;
        if (msg === 'yes') localStorage['boom_no_prompt'] = 1;
    }
    return true;
}

//消息发送
export function clientMessage(type, eventCallback) {
    let self = {};
    self.tag = Math.random();
    window.addEventListener('message', function (event) {
        if (event.data.recv_tag && event.data.recv_tag == self.tag) {
            eventCallback && eventCallback(event.data.param, event);
        }
    });
    self.send = function (param) {
        window.postMessage({ type: type, send_tag: self.tag, param: param }, '*');
        return self;
    };
    return self;
}

export function serverMessage(type, eventCallback) {
    let self = {};
    window.addEventListener('message', function (event) {
        if (event.data.type && event.data.type == type && event.data.send_tag) {
            eventCallback && eventCallback(event.data.param, function (param) {
                self.send(param, event.data.send_tag);
            });
        }
    });
    self.send = function (param, tag) {
        window.postMessage({ type: type, recv_tag: tag, param: param }, '*');
        return self;
    }
    return self;
}

/**
 * 跨域的post请求
 * @param {*} url 
 * @param {*} data 
 * @param {*} json 
 * @param {*} success 
 */
export function gm_post(url, data, json = true, success) {
    let self = {};
    GM_xmlhttpRequest({
        url: url,
        method: 'POST',
        headers: {
            'Authorization': config.vtoken || '',
            'Content-Type': json ? 'application/json' : 'application/x-www-form-urlencoded',
        },
        data: data,
        onreadystatechange: function (response) {
            if (response.readyState == 4) {
                if (response.status == 200) {
                    success && success(response.responseText);
                } else {
                    self.errorCallback && self.errorCallback(response);
                }
            }
        }
    });
    self.error = function (errorCallback) {
        self.errorCallback = errorCallback;
    }
    return self;
}

/**
 * 跨域的get请求
 * @param {*} url 
 * @param {*} data 
 * @param {*} json 
 * @param {*} success 
 */
export function gm_get(url, success) {
    let self = {};
    GM_xmlhttpRequest({
        url: url,
        method: 'GET',
        onreadystatechange: function (response) {
            if (response.readyState == 4) {
                if (response.status == 200) {
                    success && success(response.responseText);
                } else {
                    self.errorCallback && self.errorCallback(response);
                }
            }
        }
    });
    self.error = function (errorCallback) {
        self.errorCallback = errorCallback;
    }
    return self;
}

//实现GM_xmlhttpRequest
if (window.GM_xmlhttpRequest == undefined) {
    window.GM_xmlhttpRequest = function (param) {
        let send = {};
        send.url = param.url;
        send.method = param.method;
        send.data = param.data;
        send.headers = param.headers;
        clientMessage('GM_xmlhttpRequest', function (response, event) {
            if (response.event || response.event == 'onreadystatechange') {
                param.onreadystatechange && param.onreadystatechange(response);
            }
        }).send(send);
    }
}
