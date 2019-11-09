const css = require('../html/common.css');
const common = require('../common');

module.exports = {
    id: undefined,
    innerTimer: undefined,
    videoInfo: undefined,
    compile: function () {
        //完成切换
        common.log('zhs video switch');
        let self = this;
        this.innerTimer && clearTimeout(this.innerTimer);
        this.innerTimer = setTimeout(function () {
            config.auto && $(self.id + ' #nextBtn').click();
        }, config.duration);
    },
    start: function () {
        let self = this;
        self.createToolsBar();
        //hook智慧树视频
        let hookPlayerStarter = PlayerStarter;
        PlayerStarter.hookCreatePlayer = PlayerStarter.createPlayer;
        PlayerStarter.createPlayer = function ($container, options, callback) {
            self.innerTimer && clearTimeout(self.innerTimer);
            self.id = $container.selector;
            let hookPause = callback.onPause;
            let hookComplete = callback.onComplete;
            let hookReady = callback.onReady;
            let video = undefined;
            callback.onReady = function () {
                console.log('准备');
                hookReady();
                //倍速,启动!
                video = $(self.id + ' video')[0]
                $('.speedList .speedTab:contains(' + parseFloat(config.video_multiple).toFixed(1) + '):eq(0)').click()
                // video.playbackRate = config.video_multiple;
                //又是以防万一的暂停,顺带检测进度
                self.innerTimer = setInterval(function () {
                    try {
                        config.auto && video.play();
                    } catch (e) { }
                    if ($('.progressbar_box_tip').text().indexOf('100%') >= 0) {
                        self.compile();
                    }
                }, 10000);
            }
            callback.onPause = function () {
                console.log('暂停');
                hookPause();
                config.auto && video.play();
            }
            callback.onComplete = function () {
                console.log('完成');
                hookComplete();
            }
            if (config.video_mute) {
                options.volume = 0;
            }
            console.log(options);
            options.autostart = true;
            // options.control.nextBtn = true;
            this.hookCreatePlayer($container, options, callback);
        }
    },
    createToolsBar: function () {
        let tools = $('<div class="entrance_div" id="cxtools"><ul></ul></div>');
        let boomBtn = $('<li><a href="#" id="zhs-video-boom">秒过视频</a></li>');
        let ysbnBtn = $('<li><a href="#" id="zhs-ytbn" title="回到未刷课的时候">败者食尘</a></li>');
        let self = this;
        $(tools).find('ul').append(boomBtn);
        // $(tools).find('ul').append(ysbnBtn); 新版不能吔土了
        $(boomBtn).click(function () {
            if (common.boom_btn()) {
                self.sendBoomPack();
            }
        });
        $(ysbnBtn).click(function () {
            if (common.ytbn_btn()) {
                self.sendBoomPack(common.randNumber(10, 60));
            }
        });
        $('.videotop_box.clearfix,.videotop_box.fl').append(tools);
    },
    sendBoomPack: function (enterTime) {
        //发送秒过包
        //ev算法
        let evFun = D26666.Z;
        let timeStr = $('#video-' + this.videoInfo.videoId + ' .time').text();
        // let timeStr = $('#video-' + this.videoInfo.videoId + ' .time.fl,.nPlayTime .duration').text();
        let time = 0;
        let temp = timeStr.match(/[\d]+/ig);
        for (let i = 0; i < 3; i++) {
            time += temp[i] * Math.pow(60, 2 - i);
        }
        time += common.randNumber(30, 300);
        if (enterTime != undefined) {
            time = enterTime;
        }
        let tn = 5 * ((time / 5) - common.randNumber(2, 8))
        if (tn < 0) {
            tn = 0;
        }
        let ev = [
            this.videoInfo.rid,
            this.videoInfo.lessonId, 0, this.videoInfo.videoId, 1, 0, tn, time, timeStr
        ];
        let postData = '__learning_token__=' + encodeURIComponent(btoa('' + this.videoInfo.studiedLessonDto.id)) +
            '&ev=' + evFun(ev);
        common.post('/json/learningNew/saveDatabaseIntervalTime?time=' + (new Date().valueOf()), postData, false, function (res) {
            let json = JSON.parse(res);
            if (json.studyTotalTime >= time) {
                alert('秒过成功,刷新后查看效果');
            } else {
                alert('秒过失败');
            }
        });
    },
    hookAjax: function () {
        let self = this;
        window.hookXMLHttpRequest = window.hookXMLHttpRequest || XMLHttpRequest;
        XMLHttpRequest = function () {
            let retAjax = new window.hookXMLHttpRequest();
            retAjax.hookOpen = retAjax.open;
            retAjax.open = function (p1, p2, p3, p4, p5) {
                if (p2.indexOf('learning/loadVideoPointerInfo') >= 0 || p2.indexOf('learningNew/loadVideoPointerInfo') >= 0) {
                    console.log('题目来了');
                    //TODO:先实现屏蔽题目,后面实现自动填充(虽然这好像没有意义)
                    Object.defineProperty(retAjax, 'responseText', {
                        get: function () {
                            let retText = retAjax.response.replace(/"lessonDtoMap":{.*?},"lessonId"/gm, '"lessonDtoMap":{},"lessonId"');;
                            return retText;
                        }
                    });
                } else if (p2.indexOf('learning/prelearningNote') >= 0 || p2.indexOf('learningNew/prelearningNote') >= 0) {
                    //拦截数据
                    Object.defineProperty(retAjax, 'responseText', {
                        get: function () {
                            self.videoInfo = JSON.parse(retAjax.response);
                            return retAjax.response;
                        }
                    });
                }
                return retAjax.hookOpen(p1, p2, p3, p4, p5);
            }
            return retAjax;
        }
    }
}