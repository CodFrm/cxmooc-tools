const common = require('../common');
const serverConfig = require('../../config');
const until = require('./until');

module.exports = function () {
    let self = this;
    this.monitorVcode = function () {
        //验证码监控加载
        //作业处验证码
        let hookGetVarCode = window.getVarCode;
        window.getVarCode = function () {
            let notic = until.signleLine('cxmooc自动打码中...', 'dama', $('#sub').parents('td'));
            let img = document.getElementById('imgVerCode');
            getVcode('/img/code?' + new Date().getTime(), img, function (code) {
                if (code == undefined) {
                    $(notic).text('无打码权限或服务器故障');
                    return;
                }
                $(notic).text('提交验证码');
                $('input#code').val(code);
                setTimeout(function () {
                    $('a#sub').click();
                }, 2000);
            });
        }
    }

    function getVcode(url, img, callback) {
        let vcodeimg = document.createElement('img');
        $(vcodeimg).on('load', function () {
            let base64 = common.getImageBase64(vcodeimg, 'jpeg');
            img.src = base64;
            common.post(serverConfig.url + 'vcode', 'img=' + encodeURIComponent(base64.substr('data:image/jpeg;base64,'.length)), false, function (ret) {
                let json = JSON.parse(ret)
                if (json.code == -2) {
                    callback();
                    //TODO:无权限
                    return;
                }
                if (json.msg != undefined && json.msg != '') {
                    callback(json.msg);
                } else {
                    getVcode(url, img, callback);
                }
            });
        });
        vcodeimg.src = url;
    }

    self.monitorVcode();

}