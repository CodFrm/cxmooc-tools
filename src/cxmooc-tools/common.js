const md5 = require("md5");
const topic = require('./topic');
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

function video(_this, elLogo, index) {
    var wid = _this.contentDocument.getElementsByTagName('iframe')[index].contentWindow;
    var doc = _this.contentDocument.getElementsByTagName('iframe')[index].contentDocument;
    var objId = _this.contentDocument.getElementsByTagName('iframe')[index].getAttribute('objectid');
    injected(doc, 'action.js');
    //在框架内注入js
    var hang = createBtn('开始挂机');
    hang.value = index;
    hang.title = "先播放再点我";
    elLogo.appendChild(hang);
    hang.onclick = function () {
        wid.monitorPlay();
    }
    var hang_mode_2 = createBtn('挂机模式2(bate)');
    hang_mode_2.style.background = '#F57C00';
    hang_mode_2.title = "还在测试中,不知道有什么样的风险,欢迎反馈,如果能成,将在自动挂机迈出一大步^_^";
    elLogo.appendChild(hang_mode_2);
    var boom = createBtn('秒过视频');
    boom.style.background = '#F57C00';
    boom.title = "秒过视频有被后台检测到的风险";
    boom.value = index;
    elLogo.appendChild(boom);
    //获取参数
    var _index = 0;
    var mArg = _this.contentDocument.body.innerHTML;
    mArg = '{' + substrEx(mArg, 'mArg = {', ';');
    mArg = JSON.parse(mArg);
    for (let i = 0; i < mArg.attachments.length; i++) {
        if (mArg.attachments[i].objectId == objId) {
            _index = i;
            break;
        }
    }
    var getVideoTopic = function (callback) {
        //+mArg.attachments[_index].mid
        get('/richvideo/initdatawithviewer?&start=undefined&mid=' + mArg.attachments[_index].mid).onreadystatechange = function () {
            if (this.readyState == 4) {
                if (this.status == 200) {
                    var json = JSON.parse(this.responseText);
                    callback(json);
                }
            };
        }
    }
    //展示题目答案
    getVideoTopic(function (data) {
        var createDiv = function (title) {
            var divEl = document.createElement('div');
            divEl.style.color = "#ff0101";
            divEl.innerHTML = title;
            return divEl;
        }
        var getTrueAnswer = function (list) {
            for (let i = 0; i < list.length; i++) {
                if (list[i].isRight) {
                    return list[i].name + ":" + list[i].description;
                }
            }
            return '没有找到答案(没有,出bug了???)';
        }
        _this.parentNode.appendChild(createDiv('本视频题目列表:'));
        for (let i = 0; i < data.length; i++) {
            var title = "题目" + (i + 1) + ":" + data[i].datas[0].description + "<br/>答案:    " + getTrueAnswer(data[i].datas[0].options);
            var divEl = createDiv(title);
            console.log(data[i].datas[0].description);
            _this.parentNode.appendChild(divEl);
        }
    });

    //挂机模式2按钮事件
    hang_mode_2.onclick = function () {
        console.log("coding....");
    }
    //秒过按钮事件
    boom.onclick = function () {
        get('/ananas/status/' + mArg.attachments[_index].objectId +
            '?k=318&_dc=' + Date.parse(new Date())).onreadystatechange = function () {
            if (this.readyState == 4) {
                if (this.status != 200) {
                    alert('未知错误');
                } else {
                    //第二步
                    var json = JSON.parse(this.responseText);
                    var playTime = parseInt(json.duration - Math.random(1, 2));
                    var enc = '[' + mArg.defaults.clazzId + '][' + mArg.defaults.userid + '][' +
                        mArg.attachments[_index].property._jobid + '][' + mArg.attachments[_index].objectId + '][' +
                        (playTime * 1000).toString() + '][d_yHJ!$pdA~5][' + (json.duration * 1000).toString() + '][0_' +
                        json.duration + ']';
                    enc = md5(enc);
                    get('/multimedia/log/' + json.dtoken + '?clipTime=0_' + json.duration +
                        '&otherInfo=' + mArg.attachments[_index].otherInfo +
                        '&userid=' + mArg.defaults.userid + '&rt=0.9&jobid=' + mArg.attachments[_index].property._jobid +
                        '&duration=' + json.duration + '&dtype=Video&objectId=' + mArg.attachments[_index].objectId +
                        '&clazzId=' + mArg.defaults.clazzId +
                        '&view=pc&playingTime=' + playTime + '&isdrag=4&enc=' + enc).onreadystatechange = function () {
                        if (this.readyState == 4) {
                            if (this.status != 200) {
                                alert('未知错误');
                            } else {
                                alert('成功刷新后查看效果');
                            }
                        }
                    }
                }
            }

        }
    }
}

function injected(doc, file) {
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