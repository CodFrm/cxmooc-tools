import {
    showExpand,
    createBtn
} from './common';
//监听框架加载
document.addEventListener('load', function (ev) {
    var ev = ev || event;
    var _this = ev.srcElement || ev.target;
    if (_this.id == 'iframe') {
        showExpand(_this);
    }
}, true);
//监测框架
var frame = document.getElementById('iframe');
if (frame != null) {
    showExpand(frame);
}
//监测作业板块
if (window.location.href.indexOf('work/doHomeWorkNew') > 0 ) {
    var form = document.getElementById('form1');
    if (form != null) {
        //显示答题按钮
        const topic = require('./topic');
        topic(document, form.previousElementSibling, 0, false);
    }
}

if(window.location.href.indexOf('work/selectWorkQuestionYiPiYue') > 0){
    var form = document.getElementById('ZyBottom');
    if (form != null) {
        //显示答题按钮
        const topic = require('./topic');
        topic(document, form.previousElementSibling, 0, true);
    }
}
