const common = require('./common');
const chaoxing = require('./chaoxing/chaoxing');

common.removeinjected(document);
global.config = JSON.parse(localStorage['config']);
global.vtoken = config.vtoken;
global.timer = new Array();
global.signle = {};
if (window.location.href.indexOf('mycourse/studentstudy?') > 0) {
    //超星异常验证码
    signleFactory('chaoxing');
    //超星学习页面
    document.addEventListener('load', function (ev) {
        var ev = ev || event;
        var _this = ev.srcElement || ev.target;
        if (_this.id == 'iframe') {
            signleFactory('chaoxing').studentstudy();
        }
    }, true);
    var frame = document.getElementById('iframe');
    if (frame != null) {
        signleFactory('chaoxing').studentstudy();
    }
} else if (window.location.href.indexOf('ztnodedetailcontroller/visitnodedetail') > 0) {
    //超星阅读页面
    signleFactory('chaoxing').read();
} else if (window.location.href.indexOf('antispiderShowVerify.ac') > 0 || window.location.href.indexOf('html/processVerify.ac') > 0) {
    //超星异常验证码
    signleFactory('chaoxing');
}

/**
 * 单例工厂
 * @param {string} object 
 * @return plugin
 */
function signleFactory(object) {
    switch (object) {
        case 'chaoxing': {
            if (signle.cx == undefined) {
                signle.cx = new chaoxing();
            }
            return signle.cx;
        }
    }
}
