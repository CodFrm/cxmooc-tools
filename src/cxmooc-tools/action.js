/**
 * 框架(iframe)内操作js
 */
const moocConfig = require('../config');
/**
 * 开始监控暂停,自动重新播放
 */
window.monitorPlay = function (playOver, config) {
    var timer = setInterval(function () {
        var player = document.querySelector('#video_html5_api');
        if (player == undefined || player == null) {
            return;
        }
        clearInterval(timer);
        /**
         * 对cdn进行处理
         */
        if (localStorage['cdn'] != undefined) {
            var url = player.src;
            url = url.substr(url.indexOf('/video/'));
            console.log(url);
            player.src = localStorage['cdn'] + url;
            console.log(player.src);
        }
        //判断是否播放，顺便让那个按钮和界面不可见
        unshowOcclusion();
        play();
        player.onpause = function () {
            console.log('pause');
            if (player.currentTime <= player.duration - 1) {
                play();
            }
        }
        player.onloadstart = function () {
            var cdn = player.currentSrc;
            cdn = cdn.substr(0, cdn.indexOf('/video/', 10));
            localStorage['cdn'] = cdn;
            console.log('cdn change ' + cdn);
        }
        player.onended = function () {
            console.log('end');
            if (playOver != undefined) {
                playOver();
            }
        }
        function play() {
            var time = setInterval(function () {
                if (player.paused) {
                    player.play();
                    console.log(config);
                    player.muted = config.video_mute;
                    player.playbackRate = config.video_multiple;
                } else {
                    clearInterval(time);
                }
            }, 1000);
        }
    }, 200);
}
function unshowOcclusion() {
    var playBtn = document.querySelector('.vjs-big-play-button');
    console.log(playBtn);
    if (playBtn != null) {
        playBtn.style.display = 'none';
    }
    var tmp = document.querySelector('.vjs-poster');
    if (tmp != null) {
        tmp.style.display = 'none';
    }
}
window.removeOldPlayer = function (obj) {
    //服务器在线判断
    var http = new XMLHttpRequest();
    var parent = obj.parentNode.parentNode;
    http.open('GET', moocConfig.cx.player + '?v=' + moocConfig.version);
    http.onreadystatechange = function () {
        if (http.readyState == 4 && http.status == 200) {
            //移除老的视频对象
            obj.parentNode.parentNode.removeChild(obj.parentNode);
            var note = document.getElementById('note');
            var note1 = document.createElement('div');
            note1.id = 'note1-wrap';
            note1.innerHTML = '<div id="hl"></div><div id="note1">cxmooc-tools正在为您更换播放器...</div></div>';
            document.body.insertBefore(note1, note);
            newPlayer();
            var timer = setInterval(function () {
                if (localStorage['lineIndex'] == undefined || localStorage['lineIndex'] == 0) {
                    clearInterval(timer);
                    return;
                }
                var flashObj = document.querySelector('object');
                if (flashObj != null) {
                    //切换上一次记录的线路,如果没有或者为0就不进行切换了
                    if (flashObj.querySelector('[name="flashvars"]') != null) {
                        clearInterval(timer);
                        var flashvars = flashObj.querySelector('[name="flashvars"]').getAttribute('value');
                        flashObj.querySelector('[name="flashvars"]').setAttribute(
                            'value',
                            flashvars.replace('dftLineIndex%22%3A0%2C%22', 'dftLineIndex%22%3A' + localStorage['lineIndex'] + '%2C%22')
                        );
                        flashObj.setAttribute('data', flashObj.getAttribute('data'));
                    }
                }
            }, 100);
        }
    }
    http.send();
    //对线路进行监控和切换
    $(parent).bind('onChangeLine', function (h, g) {
        //监听线路切换
        localStorage['lineIndex'] = g;
    });
}

/**
 * 一个新的播放器
 */
window.newPlayer = function () {
    Ext.Ajax.autoAbort = true;

    Ext.isIpad = (navigator.userAgent.indexOf('iPad') > -1);

    Ext.isIos = (!!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/));

    Ext.isAndroid = (navigator.userAgent.indexOf("Android") > -1);

    function greenligth() {
        Ext.fly(window.frameElement).parent().addCls('ans-job-finished');
    }

    function proxy_completed() {
        greenligth();

        if (ed_complete) {
            ed_complete();
        }
    }

    function config(d) {
        return window.frameElement.getAttribute(d);
    }

    function getCookie(objname) {
        var arrstr = document.cookie.split("; ");
        for (var i = 0; i < arrstr.length; i++) {
            var temp = arrstr[i].split("=");
            if (temp[0] == objname) {
                return unescape(temp[1]);
            }
        }
    }

    function showMoocPlayer_cxmooc_tools(paras) {
        var mp = new MoocPlayer({
            isSendLog: !!parent.AttachmentSetting && parent.AttachmentSetting.control,
            data: paras,
            height: 540,
            width: 676,
            playerPath: moocConfig.cx.player + '?v=' + moocConfig.version,
            ResourcePlugPath: moocConfig.cx.resplugin + '?v=' + moocConfig.version
        });
    }

    function loadVideo() {
        var objectid = config('objectid');
        Ext.get('objectid').setHTML('文件ID:' + objectid);

        var reader = Ext.get('reader');

        if (!objectid) {
            reader.setHTML('未找到该文件');
            return;
        }

        var iframe = window.frameElement;
        var data = Ext.decode(iframe.getAttribute('data'));
        var setting = parent.AttachmentSetting;
        var mid = config('mid');
        var percent = 0;
        var vbegin = config('vbegin');
        var vend = config('vend');
        var jobid = config('jobid');
        var danmaku = data ? (data.danmaku == null ? 0 : data.danmaku) : 0;
        var fastforward = config('fastforward') == 'true' ? true : false;
        var switchwindow = config('switchwindow') == 'true' ? true : false;
        var note = Ext.get('note');
        var hl = Ext.get('hl');
        var note1Wrap = Ext.get('note1-wrap');
        var note1 = Ext.get('note1');
        var timer = null;
        var rt = data ? (data.rt ? data.rt : 0.9) : 0.9;

        function request() {
            if (percent <= 100) {
                hl.setWidth((percent += 5) + "%");
            }

            var k = getCookie('fid') || '';

            Ext.Ajax.request({
                url: '/ananas/status/' + objectid + '?k=' + k,
                success: function (response) {
                    var oData = eval('(' + response.responseText + ')');

                    Ext.get('loading').hide();

                    switch (oData.status) {
                        case 'success':
                            note1Wrap.remove();
                            var d = oData.duration,
                                paras = {
                                    enableFastForward: fastforward ? 0 : 1,
                                    enableSwitchWindow: switchwindow ? 0 : 1,
                                    duration: d,
                                    httpmd: oData.httpmd,
                                    http: oData.http,
                                    httphd: oData.httphd,
                                    httpshd: oData.httpshd,
                                    cdn: oData.cdn,
                                    filename: oData.filename,
                                    dtoken: oData.dtoken
                                };

                            if (document.cookie.length > 0) {
                                paras.memberinfo = getCookie('memberinfo');
                                paras.questionErrorLogUrl = ServerHosts.MASTER_HOST + '/question/addquestionerror';
                            }

                            if (mid) {
                                paras.mid = mid;
                            }

                            if (oData.duration) {
                                paras.videoTotalTime = oData.duration;
                            }

                            if (oData.screenshot) {
                                paras.screenshot = oData.screenshot;
                            }

                            if (oData.thumbnails) {
                                paras.thumbnails = oData.thumbnails;
                            }

                            if (vbegin) {
                                paras.startTime = vbegin;
                            }

                            if (vend) {
                                paras.endTime = vend;
                            }

                            paras.rt = rt;

                            var m = {},
                                s, vb, ve;

                            if (setting && setting.control) {
                                var attachments = setting.attachments,
                                    defaults = setting.defaults,
                                    spec = oData.objectid + "-" + (vbegin ? vbegin : 0) + "-" + (vend ? vend : d);

                                if (defaults) {
                                    paras.userid = defaults.userid || '';
                                    paras.fid = defaults.fid || '';
                                }

                                for (var i = 0; i < attachments.length; i++) {
                                    m = attachments[i], vb = 0, ve = d;
                                    if (m.property) {
                                        if (m.property.vbegin) {
                                            vb = m.property.vbegin;
                                        }
                                        if (m.property.vend) {
                                            ve = m.property.vend;
                                        }
                                    }

                                    s = m.objectId + "-" + vb + "-" + ve;

                                    if (spec == s) {
                                        Ext.apply(paras, setting.defaults);

                                        paras.headOffset = Math.floor(parseInt(m.headOffset) / 1000);
                                        paras.objectId = m.objectId;
                                        paras.otherInfo = m.otherInfo;
                                        paras.isPassed = m.isPassed;
                                        paras.danmaku = danmaku;
                                        if (jobid) {
                                            paras.jobid = jobid;
                                            if (!m.job) {
                                                greenligth();
                                                ed_complete = false;
                                                paras.enableFastForward = 1;
                                                paras.headOffset = 0;
                                            }
                                        }

                                        paras.reportUrl = paras.reportUrl && paras.reportUrl.replace("http://", window.location.protocol + "//");
                                        window._jobindex = i;
                                        break;
                                    }
                                }
                            }

                            timer && clearInterval(timer);

                            if (Ext.isIpad || Ext.isIos || Ext.isAndroid) {
                                showHTML5Player(paras);
                            } else {
                                showHTML5Player(paras);
                            }

                            break;
                        case 'failed':
                            timer && clearInterval(timer);
                            note1Wrap.remove();
                            note.show();
                            break;
                        case 'waiting':
                            note1.update(Ext.String.format('文件正在等待转换成网上阅读格式,前面还有{0}个文件排队。  文件ID: {1}', oData.queue, objectid));
                            break;
                        case 'converting':
                            note1.update(Ext.String.format('您上传的文件正在处理..., 文件ID:{0}', objectid));
                            break;
                        case 'transfer':
                            note1.update(Ext.String.format('文件正在传输，如果您使用云盘上传请勿移动位置..., 文件ID:{0}', objectid));
                    }
                },
                failure: function (resp) {
                    if (resp.status == 404) {
                        timer && clearInterval(timer);
                        note1Wrap.remove();
                        note.show();
                        Ext.get('loading').hide();
                    }
                }
            });
        }

        request();
        timer = setInterval(request, 5000);
    }

    Ext.onReady(function () {
        var fls = flashChecker();

        if (!(Ext.isIpad || Ext.isIos) && !fls.hasFlash) {
            var href = 'http://www.adobe.com/go/getflashplayer';
            Ext.get('reader').setHTML('您没有安装flashplayer，请到<a href="' + href + '" target="_blank">www.adobe.com</a>下载安装。');
        } else {
            loadVideo();
        }
    });
}