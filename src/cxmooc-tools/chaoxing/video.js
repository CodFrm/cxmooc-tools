const common = require('../common');
const until = require('./until');
const md5 = require("md5");

module.exports = function () {
    let self = this;
    /** 框架document */
    this.iframe = undefined;
    this.document = undefined;
    this.video = undefined;
    this.videoMsg = undefined;
    this.complete = undefined;
    this.loadover = undefined;
    this.mArg = undefined;
    this.pause = true;
    this.hangBtn = undefined;

    /**
     * 初始化显示视频题目
     */
    function initVideoTopic() {
        common.get('/richvideo/initdatawithviewer?&start=undefined&mid=' + self.videoMsg['mid'],
            function (data) {
                let json = JSON.parse(data);
                let div = createDiv('本视频题目列表:<br/>');
                $(self.iframe).after(div);
                for (let i = 0; i < json.length; i++) {
                    let answer = getTrueAnswer(json[i].datas[0].options);
                    let title = '题目' + (i + 1) + ':' + json[i].datas[0].description + '<br/>答案:   ' + answer + '<br/>';
                    $(div).append(title);
                }
                if (json.length <= 0) {
                    let title = '没有题目<br/>';
                    $(div).append(title);
                }
            });
    }

    /**
     * 移除初始页面
     */
    function unshowOcclusion() {
        $(self.document).find('.vjs-big-play-button').css('display', 'none');
        $(self.document).find('.vjs-poster').css('display', 'none');
    }

    function initCdn() {
        let cdn = undefined;
        if (localStorage['cdn'] != undefined) {
            cdn = $(self.document).find("[title='Playline']+.vjs-menu .vjs-menu-content .vjs-menu-item .vjs-menu-item-text:contains('" +
                localStorage['cdn'] + "')");
        }
        if (cdn == undefined || cdn.length <= 0) {
            cdn = $(self.document).find("[title='Playline']+.vjs-menu .vjs-menu-content .vjs-menu-item .vjs-menu-item-text");
        }
        cdn = cdn[0];
        $(cdn).parent().click();
    }

    /**
     * 初始化播放器
     */
    this.initPlayer = function () {
        self.video = $(self.document).find('#video_html5_api')[0];
        self.iframe.contentWindow.Ext.fly(self.document).un('mouseout');
        let html = $(self.iframe).parents('body')[0].innerHTML;
        self.mArg = JSON.parse('{' + common.substrEx(html, 'mArg = {', ';'));
        for (let i = 0; i < self.mArg.attachments.length; i++) {
            if (self.mArg.attachments[i].objectId == $(self.iframe).attr('objectid')) {
                self.videoMsg = self.mArg.attachments[i];
                break;
            }
        }
        initVideoTopic();
        initCdn(self.video);
        let play = function () {
            localStorage['cdn'] = $(self.document).find("[title='Playline']+.vjs-menu .vjs-menu-content .vjs-menu-item.vjs-selected .vjs-menu-item-text").text();
            //静音和倍速选项
            self.video.muted = config.video_mute;
            self.video.playbackRate = config.video_multiple;
            self.loadover && self.loadover(self);
        }
        $(self.video).on('loadstart', play);

        $(self.video).on('pause', function () {
            if (self.video.currentTime <= self.video.duration - 1) {
                if (!self.pause) {
                    $(self.document).find('.x-container.ans-timelineobjects.x-container-default,.ans-timelineobjectsbg').css('display', 'none');
                    self.video.play();
                }
            }
        });
        let tag = Math.random();
        localStorage['now_video_tag'] = tag;
        let pauseTimer = setInterval(function () {
            //以防万一的暂停- -
            if (!self.pause && localStorage['now_video_tag'] == tag) {
                self.video.paused && self.video.play();
            } else if (localStorage['now_video_tag'] != tag) {
                clearInterval(pauseTimer);
            }
        }, 10000);

        $(self.video).on('ended', function () {
            if (undefined != self.complete) {
                self.complete();
            }
            clearInterval(pauseTimer);
        });
    }

    this.start = function () {
        common.log(self.iframe.className + " video start")
        self.startPlay();
    }

    /**
     * 开始播放
     */
    this.startPlay = function () {
        if (self.pause) {
            $(self.hangBtn).text('暂停挂机');
        } else {
            $(self.hangBtn).text('开始挂机');
        }
        self.pause = !self.pause;
        unshowOcclusion();
        setTimeout(function () {
            self.video.play();
        }, 0);
    }

    /**
     * 秒过视频
     */
    this.passVideo = function () {
        if (localStorage['boom_no_prompt'] == undefined || localStorage['boom_no_prompt'] != 1) {
            let msg = prompt('秒过视频会产生不良记录,是否继续?如果以后不想再弹出本对话框请在下方填写yes')
            if (msg === null) return;
            if (msg === 'yes') localStorage['boom_no_prompt'] = 1;
        }
        sendTimePack(self.mArg, self.videoMsg, self.video.duration, function (ret) {
            if (ret == true) {
                alert('秒过成功,刷新后查看效果');
            } else {
                alert('操作失败,错误');
            }
        });
    }

    /**
     * 下载视频
     */
    this.downloadVideo = function () {
        window.open($(self.video).attr('src'));
    }

    /**
     * 创建按钮
     */
    this.createButton = function () {
        self.hangBtn = until.createBtn('开始挂机', '点击开始自动挂机播放视频');
        let pass = until.createBtn('秒过视频', '秒过视频会被后台检测到');
        let download = until.createBtn('下载视频', '我要下载视频好好学习');
        pass.style.background = '#F57C00';
        download.style.background = '#999999';
        let prev = $(self.iframe).prev();
        until.dealTaskLabel(prev);
        $(prev).append(self.hangBtn);
        $(prev).append(pass);
        $(prev).append(download);
        self.hangBtn.onclick = self.startPlay;
        pass.onclick = self.passVideo;
        download.onclick = self.downloadVideo;
    }

    this.init = function () {
        self.document = self.iframe.contentDocument;
        self.createButton();
        let timer = setInterval(function () {
            if ($(self.document).find('#video_html5_api').length > 0) {
                clearInterval(timer);
                self.initPlayer();
            }
        }, 500);
    }

    return this;
}

/**
 * 获取视频信息
 * @param {string} objectId 
 */
function getVideoInfo(objectId, schoolId, success) {
    common.get('/ananas/status/' + objectId + '?k=' + schoolId + '&_dc=' + Date.parse(new Date()),
        function (data) {
            var json = JSON.parse(data);
            success(json);
        });
}

/**
 * 发送视频时间包
 */
function sendTimePack(mArg, videoMsg, playTime, success) {
    getVideoInfo(videoMsg.objectId, mArg.defaults.fid, function (videoInfo) {
        playTime = parseInt(playTime || (videoInfo.duration - Math.random(1, 2)));
        let enc = '[' + mArg.defaults.clazzId + '][' + mArg.defaults.userid + '][' +
            videoMsg.property._jobid + '][' + videoMsg.objectId + '][' +
            (playTime * 1000).toString() + '][d_yHJ!$pdA~5][' + (videoInfo.duration * 1000).toString() + '][0_' +
            videoInfo.duration + ']';
        enc = md5(enc);
        common.get(mArg.defaults.reportUrl + '/' + videoInfo.dtoken + '?clipTime=0_' + videoInfo.duration +
            '&otherInfo=' + videoMsg.otherInfo +
            '&userid=' + mArg.defaults.userid + '&rt=0.9&jobid=' + videoMsg.property._jobid +
            '&duration=' + videoInfo.duration + '&dtype=Video&objectId=' + videoMsg.objectId +
            '&clazzId=' + mArg.defaults.clazzId +
            '&view=pc&playingTime=' + playTime + '&isdrag=4&enc=' + enc, function (data) {
                let isPassed = JSON.parse(data);
                success(isPassed.isPassed);
            });
    });
}

/**
 * 创建div
 * @param {string} title 
 */
function createDiv(title) {
    let divEl = document.createElement('div');
    divEl.style.color = "#ff0101";
    divEl.style.textAlign = 'left';
    divEl.innerHTML = title;
    return divEl;
}

/**
 * 获取正确答案
 * @param {int} list 
 */
function getTrueAnswer(list) {
    let right = '';
    for (let i = 0; i < list.length; i++) {
        if (list[i].isRight) {
            right += '<span style="margin-left:6px;">' + list[i].name + ":" + list[i].description + '</span>';
        }
    }
    if (right != '') {
        return right;
    }
    return '没有找到答案(没有,出bug了???)';
}
