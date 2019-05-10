const video = require('./video');
const topic = require('./topic');

module.exports = {
    video: function () {
        video.hookAjax();
        let timer = setInterval(function () {
            try {
                video.start();
                clearInterval(timer);
            } catch (e) { }
        }, 499);
    },
    stuExam: function () {
        topic.stuExam();
    }
};

