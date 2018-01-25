console.log('cxmooc-tools start');
//监听框架加载
document.addEventListener('load', function (ev) {
    var ev = ev || event;
    var _this = ev.srcElement || ev.target;
    if (_this.id == 'iframe') {
        showExpand(_this);
    }
}, true);
showExpand(document.getElementById('iframe'));
/**
 * 显示扩展按钮,并绑定事件
 * @param {iframe document} _this 
 */
function showExpand(_this) {
    ans = _this.contentWindow.document.getElementsByClassName('ans-job-icon');
    for (var i = 0; i < ans.length; i++) {
        ans[i].style.width = '100%';
        var boom = createBtn('秒过视频');
        ans[i].appendChild(boom);
        boom.onclick = function () {
            //获取参数
            var mArg = _this.contentWindow.document.body.innerHTML;
            mArg = '{' + substrEx(mArg, 'mArg = {', ';');
            mArg = JSON.parse(mArg);
            console.log(mArg);
            get('/ananas/status/' + mArg.attachments["0"].property.objectid +
                '?k=318&_dc=' + Date.parse(new Date())).onreadystatechange = function () {
                if (this.readyState == 4) {
                    if (this.status != 200) {
                        alert('未知错误');
                    } else {
                        //第二步
                        var json = JSON.parse(this.responseText);
                        var playTime = parseInt(json.duration - Math.random(1, 2));
                        var enc = '[' + mArg.defaults.clazzId + '][' + mArg.defaults.userid + '][' +
                            mArg.attachments["0"].property._jobid + '][' + mArg.attachments["0"].objectId + '][' +
                            (playTime * 1000).toString() + '][d_yHJ!$pdA~5][' + (json.duration * 1000).toString() + '][0_' +
                            json.duration + ']';
                        enc = hex_md5(enc);
                        get('/multimedia/log/' + json.dtoken + '?clipTime=0_' + json.duration +
                            '&otherInfo=' + mArg.attachments["0"].otherInfo +
                            '&userid=' + mArg.defaults.userid + '&rt=0.9&jobid=' + mArg.attachments["0"].property._jobid +
                            '&duration=' + json.duration + '&dtype=Video&objectId=' + mArg.attachments["0"].objectId +
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

function substrEx(str, left, right) {
    var leftPos = str.indexOf(left) + left.length;
    var rightPos = str.indexOf(right, leftPos);
    return str.substring(leftPos, rightPos);
}

function createRequest() {
    var xmlhttp;
    if (window.XMLHttpRequest) {
        xmlhttp = new XMLHttpRequest();
    } else {
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    return xmlhttp;
}

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
    return btn;
}