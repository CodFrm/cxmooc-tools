import './common';
const common = require('../cxmooc-tools/common');
const chaoxing = require('../cxmooc-tools/chaoxing/chaoxing');

window.onload = function () {
    let cx = new chaoxing();
    if (window.location.href.indexOf('mycourse/studentstudy?') > 0) {
        //手机检测
        if (common.isPhone()) {
            if (confirm('移动设备刷课将带来一定的不良风险,点击确定解锁移动端任务点通过功能')) {
                global.allowPhone = true;
            }
        }
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
    } else if (window.location.href.indexOf('exam/test/reVersionTestStartNew') > 0) {
        cx.exam();
    } else if (window.location.href.indexOf('exam/test/reVersionPaperMarkContentNew') > 0) {
        cx.collectExam();
    } else if (window.location.href.indexOf('work/doHomeWorkNew') > 0) {
        cx.homework();
    }else if(window.location.href.indexOf('work/selectWorkQuestionYiPiYue')>0){
cx.collectHomeWork();
    }
}
