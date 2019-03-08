/**
 * 超星刷课功能集合
 */
const Video = require('./video');
const Topic = require('./topic');

module.exports = function () {
    let self = this;
    this.list = new Array();
    this.index = 0;
    /**
     * 查找iframe
     * @param iframeElement 
     */
    function findIframe(iframeElement) {
        for (let i = 0; i < iframeElement.length; i++) {
            if ($(iframeElement[i]).attr('cxmooc-tools') == 'requisition') {
                continue;
            }
            let obj = undefined;
            if ($(iframeElement[i]).hasClass('ans-insertvideo-online')) {
                obj = new Video();
            } else if ($(iframeElement[i]).attr('src').indexOf('modules/work') > 0) {
                obj = new Topic();
            }
            if (obj != undefined) {
                self.list.push(obj);
                obj.complete = self.complete;
                obj.loadover = self.loadover;
                obj.init(iframeElement[i]);
                $(iframeElement[i]).attr('cxmooc-tools', 'requisition');
            }
            findIframe($(iframeElement[i].contentDocument).find('iframe'));
        }
    }

    this.complete = function () {
        //完成事件,进行完成操作
        if (config.auto) {
            lazySwitch();
        }
    }

    /**
     * 延迟切换
     */
    function lazySwitch() {
        //无任务
        setTimeout(function () {
            config.auto && switchTask();
        }, (config.interval || 0.1) * 60000);
    }

    this.loadover = function (event) {
        if (event == self.list[0]) {
            //第一个加载完成
            if (config.answer_ignore && self.list[self.index] instanceof Topic) {
                lazySwitch();
            } else {
                config.auto && event.start();
            }
        }
    }

    function switchTask() {
        //切换下一个未完成的任务
        if (self.list.length > 0 && self.index < self.list.length - 1) {
            self.index += 1;
            if (config.answer_ignore && self.list[self.index] instanceof Topic) {
                switchTask();
            } else {
                self.list[self.index].start();
            }
            return;
        }
        let folder = $('.tabtags').find('span');
        for (let i = 0; i < folder.length; i++) {
            if ($(folder[i]).hasClass('currents')) {
                if (i < folder.length - 1) {
                    folder[i + 1].click();
                    return;
                }
            }
        }
        nextTaskPoint();
    }

    function nextTaskPoint() {
        let undone = $('.ncells .currents').parents(".ncells").nextAll(".ncells").find("[class*='orange']");
        if (undone.length <= 0) {
            alert('所有任务点已完成');
            return;
        }
        undone = undone[0];
        let a = $(undone).parents('a')[0];
        a.click();
        //为了好看
        $(".currents[id*='cur']").removeClass('currents');
        $(undone).parent().addClass('currents');
    }

    this.studentstudy = function () {
        let biggestTimeoutId = window.setTimeout(function () { }, 1);
        for (let i = 1; i <= biggestTimeoutId; i++) {
            clearTimeout(i);
        }
        let timer = setInterval(function () {
            let iframe = $('iframe');
            if (iframe.length > 0) {
                clearInterval(timer);
            }
            findIframe(iframe);
        }, 500);
        //无任务        
        setTimeout(function () {
            if (self.list.length <= 0 && config.auto) {
                switchTask();
            }
        }, (config.interval || 0.1) * 60000);
    }
    return this;
}

