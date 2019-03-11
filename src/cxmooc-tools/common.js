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
    doc.head.appendChild(temp);
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
    try {
        var xmlhttp = createRequest();
        xmlhttp.open("GET", url, true);
        xmlhttp.send();
    } catch (e) {
        return false;
    }
    xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (this.status == 200) {
                success(this.responseText);
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
    try {
        var xmlhttp = createRequest();
        xmlhttp.open("POST", url, true);
        if (json) {
            xmlhttp.setRequestHeader("Content-Type", "application/json");
        } else {
            xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        }
        xmlhttp.send(data);
    } catch (e) {
        return false;
    }
    xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (this.status == 200) {
                success(this.responseText);
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