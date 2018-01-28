import {
    showExpand
} from './common';
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