
module.exports = {
    start: function () {
        //hook智慧树视频
        let hookPlayerStarter = PlayerStarter;
        PlayerStarter.hookCreatePlayer = PlayerStarter.createPlayer;
        PlayerStarter.createPlayer = function ($container, options, callback) {
            let hookPause = callback.onPause;
            let hookComplete = callback.onComplete;
            callback.onPause = function () {
                hookPause();
                //TODO:自动开始
            }
            callback.onComplete = function () {
                hookComplete();
                //TODO:完成切换
                hookPause();
            }
            if (config.video_mute) {
                options.volume = 0;
            }
            //TODO:内置倍速
            options.rate = config.video_multiple || 1;
            console.log(options);
            options.autostart = true;
            // options.control.nextBtn = true;
            this.hookCreatePlayer($container, options, callback);
        }
    }
}
