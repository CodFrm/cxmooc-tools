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
        if (ans[i].nextSibling.className.indexOf('ans-insertvideo-online') < 0) {
            //判断是否为视频
            continue;
        }
        console.log(_this.contentDocument.querySelector('iframe'));
        console.log(_this.contentDocument.getElementsByTagName('iframe'));
        var doc=_this.contentDocument.getElementsByTagName('iframe')[i].contentDocument;
        console.log(doc);
        ans[i].style.width = '100%';
        ans[i].style.textAlign = 'center';
        var hang = createBtn('开始挂机');
        hang.value = i;
        ans[i].appendChild(hang);
        hang.onclick = function () {
            var player = doc.querySelector('object');
            var time = setInterval(function () {
                try {
                    player.playMovie();
                } catch (e) {
                    clearInterval(time);
                }
            }, 1000);
        }
        var boom = createBtn('秒过视频');
        boom.value = i;
        ans[i].appendChild(boom);
        boom.onclick = function () {
            //获取参数
            var _index = this.value;
            var mArg = _this.contentWindow.document.body.innerHTML;
            mArg = '{' + substrEx(mArg, 'mArg = {', ';');
            mArg = JSON.parse(mArg);
            get('/ananas/status/' + mArg.attachments[_index].property.objectid +
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