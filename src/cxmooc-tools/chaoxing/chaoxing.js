/**
 * 超星刷课功能集合
 */
const video = require('./video');
const topic = require('./topic');

module.exports = function () {
    let self = this;
    this.video = new video();
    this.topic = new topic();

    /**
     * 查找iframe
     * @param iframeElement 
     */
    function findIframe(iframeElement) {
        for (let i = 0; i < iframeElement.length; i++) {
            if (iframeElement[i].contentWindow.location.href.indexOf('video') > 0) {
                self.video.init(iframeElement[i]);
                self.video.complete = function () {
                    //完成事件
                }
            } else if (iframeElement[i].contentWindow.location.href.indexOf('modules/work') > 0) {
                self.topic.init(iframeElement[i]);
            }
            findIframe($(iframeElement[i].contentDocument).find('iframe'));
        }
    }

    this.studentstudy = function () {
        let timer = setInterval(function () {
            let iframe = $('iframe');
            if (iframe.length > 0) {
                clearInterval(timer);
            }
            findIframe(iframe);
        }, 500);
    }
    return this;
}

