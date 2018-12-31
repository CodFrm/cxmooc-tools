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
        //处理某些标签
        var delSpans = ans[i].getElementsByTagName('span');
        for (var n = 0; n < delSpans.length; n++) {
            delSpans[n].setAttribute('style', '');
        }
        //如果是挂机模式,并且是第一个,点击,启动!
        if (i == 0 && config['auto']) {
            setTimeout(function () {
                _this.contentDocument.getElementById('action-btn').click();
            }, 2000);
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
        xmlhttp.send();
    } catch (e) {
        return false;
    }
    return xmlhttp;
}

export function post(url, data, json = true) {
    try {
        var xmlhttp = createRequest();
        xmlhttp.open("POST", url, true);
        if (json) {
            xmlhttp.setRequestHeader("Content-Type", "application/json");
        }else{
            xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        }
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
    var nextBtn = next.nextElementSibling.getElementsByTagName('a')[0];
    if (nextBtn.href.indexOf('getTeacherAjax') <= 0) {
        console.log('switch task lock');
        setTimeout(function () {
            switchTask();
        }, 2000);
    } else {
        now.className = '';
        nextBtn.click();
        nextBtn.firstElementChild.className = 'currents';
        console.log('next task');
    }
    return true;
}

export function dealRegx(str, topic) {
    topic = topic.replace('(', '\\(');
    topic = topic.replace(')', '\\)');
    str = str.replace('{topic}', '[\\s\\S]{0,6}?' + topic + '[\\s\\S]*?');
    str = str.replace('{answer}', '(\\S+)');
    return str;
}

/** 
 * 去除html标签
 */
export function removeHTML(html) {
    //先处理img标签
    var imgReplace = /<img .*?src="(.*?)".*?>/g;
    html = html.replace(imgReplace, '$1');
    var revHtml = /<.*?>/g;
    html = html.replace(revHtml, '');
    html = html.replace(/(^\s+)|(\s+$)/g, '');
    return html.replace(/&nbsp;/g, ' ');
}

/**
 * 获取本地题库中的信息
 * @param {*} topic 
 */
export function getLocalTopic(topic, count) {
    count = count == undefined ? 1 : count;
    try {
        if (localStorage['topic_regx'] == undefined || localStorage['topic_regx'] == '') {
            return;
        }
        var reg = new RegExp(dealRegx(localStorage['topic_regx'], topic));
        console.log(reg);
        var str = localStorage['topics'];
        var arr = reg.exec(str);
        if (arr != null) {
            return {
                content: arr[0],
                answer: arr.length >= 2 ? arr[1] : ''
            };
        } else if (count <= 2) {
            return getLocalTopic(topic.substring(count, topic.length - 2), ++count);
        }
    } catch (e) {

    }
    return;
}

export function pop_prompt(text, sec = 4) {
    var box = document.createElement('div');
    box.style.position = "absolute";
    box.style.background = "#aeffab";
    box.style.fontSize = "18px";
    box.style.padding = "4px 20px";
    box.style.borderRadius = "20px";
    box.style.top = "50%";
    box.style.left = "50%";
    box.style.transform = "translate(-50%,-50%)";
    box.style.transition = "1s";
    box.style.opacity = "0";
    box.innerText = text;
    setTimeout(function () {
        box.style.opacity = "0";
        setTimeout(function () {
            box.remove();
        }, 1000)
    }, sec * 1000);
    return box;
}