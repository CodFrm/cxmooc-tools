const video = require('./video');

module.exports = {
    video: function () {
        video.hookAjax();
        let timer = setInterval(function () {
            try {
                video.start();
                clearInterval(timer);
            } catch (e) { }
        }, 499);
    }
};

