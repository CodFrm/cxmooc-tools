import './common';
const chaoxing = require('../cxmooc-tools/chaoxing/chaoxing');

let cx = new chaoxing();
if (window.location.href.indexOf('mycourse/studentstudy?') > 0) {
    //超星学习页面
    document.addEventListener('load', function (ev) {
        var ev = ev || event;
        var _this = ev.srcElement || ev.target;
        if (_this.id == 'iframe') {
            cx.studentstudy();
        }
    }, true);
    var frame = document.getElementById('iframe');
    if (frame != null) {
        cx.studentstudy();
    }
} else if (window.location.href.indexOf('ztnodedetailcontroller/visitnodedetail') > 0) {
    //超星阅读页面
    cx.read();
}
