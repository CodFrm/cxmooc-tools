const topic = require('./topic');
const video = require('./video');
/**
 * 显示扩展按钮,并绑定事件
 * @param {iframe document} _this 
 */
export function showExpand(_this) {
    var ans = _this.contentDocument.getElementsByClassName('ans-job-icon');
    var config = JSON.parse(localStorage['config']);
    clearInterval(window.switchTimer);
    if (ans.length <= 0 && config['auto']) {
        //没有任务点,正在挂机的状态,5s后切换下一个
        console.log('null,switch task');
        window.switchTimer = setTimeout(function () {
            switchTask();
        }, 5000);
        return;
    }
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
        //如果是挂机模式,并且是第一个,点击,启动!
        if (i == 0 && config['auto']) {
            _this.contentDocument.getElementById('action-btn').click();
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
    var tabs = tab[0].getElementsByTagName('span');
    for (var i = 0; i < tabs.length; i++) {
        if (tabs[i].className.indexOf('currents') > 0) {
            //现行,切换到下一个
            if (i + 1 >= tabs.length) {
                //超过长度
                break;
            } else {
                return tabs[i + 1];
            }
        }
    }
    //可以换页了
    return false;
}

export function switchTask() {
    // var now = Math.round(new Date().getTime() / 1000);
    // if (localStorage['last'] != undefined) {
    //     //判断上次间隔
    //     console.log();
    //     if (now - localStorage['last'] < 4) {
    //         //小于4秒不进行操作,返回
    //         return;
    //     }
    // }
    // localStorage['last'] = Math.round(new Date().getTime() / 1000);
    //判断选项夹
    var tab = switchChoice();
    if (tab !== false) {
        tab.click();
        return true;
    }
    //判断任务点
    var course = document.getElementById('coursetree');
    var now = course.getElementsByClassName('currents');
    if (now.length <= 0) {
        alert('很奇怪啊');
        return false;
    }
    now = now[0];
    now.className = '';
    var next = now.parentNode.parentNode;
    if (next.nextElementSibling == undefined) {
        if (next.parentNode.nextElementSibling == undefined) {
            alert('挂机完成了');
            return true;
        } else {
            next = next.parentNode;
        }
    }
    //两个父节点后,下一个兄弟节点的第一个节点,点击,启动!
    console.log(next);
    next.nextElementSibling.getElementsByTagName('a')[0].click();
    next.nextElementSibling.getElementsByTagName('a')[0].firstElementChild.className = 'currents';
    console.log('next task');
    return true;
}