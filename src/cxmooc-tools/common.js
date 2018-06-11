const topic = require('./topic');
const video = require('./video');
/**
 * 显示扩展按钮,并绑定事件
 * @param {iframe document} _this 
 */
export function showExpand(_this) {
    var ans = _this.contentDocument.getElementsByClassName('ans-job-icon');
    for (var i = 0; i < ans.length; i++) {
        ans[i].style.width = '100%';
        ans[i].style.textAlign = 'center';
        if (ans[i].nextSibling.className.indexOf('ans-insertvideo-online') >= 0) {
            //视频
            video(_this, ans[i], i);
        } else if (ans[i].parentNode.className.indexOf('ans-attach-ct ans-job-finished') >= 0) {
            //做完的题目
            topic(_this, ans[i], i, true);
        } else if (ans[i].parentNode.className.indexOf('ans-attach-ct') >= 0) {
            //未做完的题目
            topic(_this, ans[i], i, false);
        }
    }
}

export function injected(doc, file) {
    var path = 'src/' + file;
    var temp = doc.createElement('script');
    temp.setAttribute('type', 'text/javascript');
    temp.src = document.head.getAttribute('chrome-url') + path;
    doc.head.appendChild(temp);
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
/**
 * get请求
 * @param {*} url 
 */
export function get(url) {
    try {
        var xmlhttp = createRequest();
        xmlhttp.open("GET", url, true);
        xmlhttp.send(data);
    } catch (e) {
        return false;
    }
    return xmlhttp;
}

export function post(url, data) {
    try {
        var xmlhttp = createRequest();
        xmlhttp.open("POST", url, true);
        xmlhttp.setRequestHeader("Content-Type", "application/json");
        xmlhttp.send(data);
    } catch (e) {
        return false;
    }
    return xmlhttp;
}

/**
 * 创建一个按钮
 * @param {*} title 
 */
export function createBtn(title) {
    var btn = document.createElement('button');
    btn.innerText = title;
    btn.style.outline = 'none';
    btn.style.border = '0';
    btn.style.background = '#7d9d35';
    btn.style.color = '#fff';
    btn.style.borderRadius = '4px';
    btn.style.padding = '2px 8px';
    btn.style.cursor = 'pointer';
    btn.style.fontSize = '12px';
    btn.style.marginLeft = '4px';
    btn.onmousemove = () => {
        btn.style.boxShadow = '1px 1px 1px 1px #ccc';
    };
    btn.onmouseout = () => {
        btn.style.boxShadow = '';
    };
    return btn;
}

export function switchChoice() {
    var tab = document.getElementsByClassName('tabtags');
    if (tab.length <= 0) {
        return false;
    }
    var tabs=tab[0].getElementsByTagName('span');
    for(var i=0;i<tabs.length;i++){
        if(tabs[i].className.indexOf('currents')>0){
            //现行,切换到下一个
        }
    }
    //可以换页了
    console.log(tabs);
}