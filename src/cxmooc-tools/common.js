import {
    hex_md5
} from './md5';

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
        } else {
            //题目
            topic(_this, ans[i], i);
        }
    }
}

function topic(_this, elLogo, index) {
    var doc = _this.contentDocument.getElementsByTagName('iframe')[index].contentDocument;
    var topicDoc = doc.getElementById('frame_content').contentDocument;
    var html = topicDoc.body.innerHTML;
    var topicList = topicDoc.getElementsByClassName('Zy_TItle');
    for (var i = 0; i < topicList.length; i++) {
        console.log(getTopicMsg(topicList[i]));
    }

}

/**
 * 获取题目信息
 * @param {*} elTopic 
 */
function getTopicMsg(elTopic) {
    var msg = {};
    msg.topic = elTopic.querySelector('div.clearfix').innerText;
    msg.type = substrEx(msg.topic, '【', '】');
    switch (msg.type) {
        case '单选题':
            {
                msg.type = 1;
                break;
            }
        case '多选题':
            {
                msg.type = 2;
                break;
            }
        case '判断题':
            {
                msg.type = 3;
                break;
            }
    }
    msg.topic = msg.topic.substring(msg.topic.indexOf('】') + 1);
    msg.topic = msg.topic.substring(0, msg.topic.indexOf('（'));
    var elOption = elTopic.nextSibling.nextSibling.getElementsByTagName('li');
    msg.option = [];
    for (var i = 0; i < elOption.length; i++) {
        var content = '';
        var op = elOption[i].querySelector('input').value;
        if (msg.type == 3) {
            op = (op == 'true' ? 'Y' : 'N');
            content = op;
        } else {
            content = elOption[i].querySelector('.after').innerText;
        }
        msg.option.push({
            op: op,
            content: content,
        });
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
    elLogo.appendChild(hang);
    hang.onclick = function () {
        wid.monitorPlay();
    }
    var boom = createBtn('秒过视频');
    boom.value = index;
    elLogo.appendChild(boom);
    boom.onclick = function () {
        //获取参数
        var _index = 0;
        var mArg = _this.contentDocument.body.innerHTML;
        mArg = '{' + substrEx(mArg, 'mArg = {', ';');
        mArg = JSON.parse(mArg);
        for(let i=0;i<mArg.attachments.length;i++){
            if(mArg.attachments[i].objectId == objId){
                _index=i;
                break;
            }
        }
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
                    enc = hex_md5(enc);
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
function substrEx(str, left, right) {
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
function get(url) {
    try {
        var xmlhttp = createRequest();
        xmlhttp.open("GET", url, true);
        xmlhttp.send();
    } catch (e) {
        return false;
    }
    return xmlhttp;
}
/**
 * 创建一个按钮
 * @param {*} title 
 */
function createBtn(title) {
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
    return btn;
}