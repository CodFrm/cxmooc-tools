const common = require('../common');
const serverConfig = require('../../config');
const until = require('./until');

module.exports = function () {
    let self = this;
    this.monitorVcode = function () {
        //验证码监控加载
        //作业处验证码
        window.getVarCode = function () {
            let notic = until.signleLine('cxmooc自动打码中...', 'dama', $('#sub').parents('td'));
            let img = document.getElementById('imgVerCode');
            getVcode('/img/code?' + new Date().getTime(), img, function (code) {
                if (code === undefined) {
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
        //异常验证码
        let yc = document.getElementById('ccc');
        if (yc != undefined) {
            yc.onclick = function () {
                getVcode('/processVerifyPng.ac?t=' + Math.floor(2147483647 * Math.random()), yc, function (code) {
                    if (code === undefined) {
                        alert('打码已超上限');
                        return;
                    }
                    document.getElementById('ucode').value = code;
                    setTimeout(function () {
                        document.getElementsByClassName('submit')[0].click();
                    }, 2000);
                });
            }
        }
    }

    function getVcode(url, img, callback) {
        let vcodeimg = document.createElement('img');
        vcodeimg.onload = function () {
            let base64 = common.getImageBase64(vcodeimg, 'jpeg');
            img.src = base64;
            common.post(serverConfig.url + 'vcode', 'img=' + encodeURIComponent(base64.substr('data:image/jpeg;base64,'.length)), false, function (ret) {
                let json = JSON.parse(ret)
                if (json.code == -2) {
                    callback();
                    //TODO:无权限
                } else if (json.msg) {
                    callback(json.msg);
                } else {
                    getVcode(url, img, callback);
                }
            });
        }
        vcodeimg.src = url;
    }

    self.monitorVcode();

}