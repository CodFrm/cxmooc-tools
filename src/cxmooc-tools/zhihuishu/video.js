
module.exports = {
    id: undefined,
    innerTimer: undefined,
    compile: function () {
        //完成切换
        let self = this;
        this.innerTimer && clearTimeout(this.innerTimer);
        this.innerTimer = setTimeout(function () {
            config.auto && $(self.id + ' #nextBtn').click();
        }, config.duration);
    },
    start: function () {
        let self = this;
        //hook智慧树视频
        let hookPlayerStarter = PlayerStarter;
        PlayerStarter.hookCreatePlayer = PlayerStarter.createPlayer;
        PlayerStarter.createPlayer = function ($container, options, callback) {
            self.innerTimer && clearTimeout(self.innerTimer);
            self.id = $container.selector;
            let hookPause = callback.onPause;
            let hookComplete = callback.onComplete;
            let hookReady = callback.onReady
            let video = undefined;
            callback.onReady = function () {
                console.log('准备');
                hookReady();
                //倍速,启动!
                video = $(self.id + ' video')[0]
                video.playbackRate = config.video_multiple;
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
                self.compile();
            }
            if (config.video_mute) {
                options.volume = 0;
            }
            //TODO:内置倍速
            options.rate = config.video_multiple || (config.video_multiple <= 1.5 ? config.video_multiple : 1);
            console.log(options);
            options.autostart = true;
            // options.control.nextBtn = true;
            this.hookCreatePlayer($container, options, callback);
        }
    },
    hookAjax: function () {
        window.hookXMLHttpRequest = window.hookXMLHttpRequest || XMLHttpRequest;
        XMLHttpRequest = function () {
            let retAjax = new window.hookXMLHttpRequest();
            retAjax.hookOpen = retAjax.open;
            retAjax.open = function (p1, p2, p3, p4, p5) {
                if (p2.indexOf('learning/loadVideoPointerInfo') >= 0) {
                    console.log('题目来了');
                    //TODO:先实现屏蔽题目,后面实现自动填充(虽然这好像没有意义)
                    Object.defineProperty(retAjax, 'responseText', {
                        get: function () {
                            let retText = retAjax.response.replace(/"lessonDtoMap":{.*?},"lessonId"/gm, '"lessonDtoMap":{},"lessonId"');;
                            return retText;
                        }
                    });
                }
                return retAjax.hookOpen(p1, p2, p3, p4, p5);
            }
            return retAjax;
        }
    }
}