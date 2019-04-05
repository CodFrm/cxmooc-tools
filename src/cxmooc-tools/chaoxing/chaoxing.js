/**
 * 超星刷课功能集合
 */
const common = require('../common');
const until = require('./until');
const Video = require('./video');
const Topic = require('./topic');
const image2base64 = require('image-to-base64');

module.exports = function () {
    let self = this;
    this.list = new Array();
    this.index = 0;
    this.iframe = undefined;
    this.document = undefined;
    this.tag = Math.random();
    this.complete_num = 0;
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
                obj.iframe = iframeElement[i];
                obj.complete = self.complete;
                obj.loadover = self.loadover;
                $(iframeElement[i]).attr('cxmooc-tools', 'requisition');
            }
            findIframe($(iframeElement[i].contentDocument).find('iframe'));
        }
    }

    this.complete = function (event) {
        switch (event) {
            case 1: {
                lazySwitch(this.pushTopic);
                break;
            }
            case 2: {
                switchTask()
                break;
            }
            default: {
                //完成事件,进行完成操作
                lazySwitch();
            }
        }
    }

    /**
     * 延迟切换
     */
    function lazySwitch(callback) {
        //无任务
        config.auto && self.notice(config.interval + "分钟后插件将自动切换下一节任务");
        let duration = (config.interval || 1) * 60000;
        setTimeout(function () {
            if (callback == undefined) {
                switchTask();
            } else {
                callback();
            }
        }, duration);
    }

    this.loadover = function (event) {
        if (event == self.list[0]) {
            //第一个加载完成
            event.pause && config.auto && ignoreCompile(event);
        }
    }


    //忽略完成的任务
    function ignoreCompile(event) {
        if (config.answer_ignore && self.list[self.index] instanceof Topic) {
            switchTask();
        } else {
            if (until.isFinished(event.iframe) || !until.isTask(event.iframe)) {
                //完成了,或者非任务点
                switchTask();
            } else {
                //判断是否切换了页面
                if ($(self.iframe).attr('tag') != self.tag) {
                    return;
                }
                self.complete_num++;
                event.start();
            }
        }
    }

    function switchTask() {
        if (!config.auto) {
            return;
        }
        //判断是否切换了页面
        if ($(self.iframe).attr('tag') != self.tag) {
            return;
        }
        if (self.list[self.index] != undefined) {
            common.log(self.list[self.index].iframe.className + " " + self.index + " switch")
        } else {
            common.log("null " + self.index + " switch")
        }
        //切换下一个未完成的任务
        if (self.list.length > 0 && self.index < self.list.length - 1) {
            self.index += 1;
            ignoreCompile(self.list[self.index]);
            return;
        }
        if (self.complete_num <= 0) {
            self.complete_num = 1;
            lazySwitch();
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
        let undone = $('.ncells .currents').parents(".cells,.ncells").nextAll(".ncells,.cells").find("[class*='orange']");
        if (undone.length <= 0) {
            //扫描锁
            if ($('.roundpointStudent.lock').length > 0) {
                setTimeout(nextTaskPoint, 4000);
            } else {
                alert('所有任务点已完成');
            }
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
        common.log("studentstudy load")
        let iframe = $('iframe');
        self.iframe = iframe;
        $(iframe).attr('tag', self.tag);
        self.document = self.iframe[0].contentDocument
        self.notice(config.auto ? '正在自动挂机中' : '');
        findIframe(iframe);
        for (let i = 0; i < self.list.length; i++) {
            self.list[i].init();
        }
        //无任务
        if (self.list.length <= 0) {
            setTimeout(function () {
                switchTask();
            }, (config.interval || 0.1) * 60000);
        }
        //监控验证码
        self.monitorVcode();
    }

    this.monitorVcode = function () {
        //验证码监控加载
        let hookGetVarCode = window.getVarCode;
        window.getVarCode = function () {
            let img = document.getElementById('imgVerCode');
            image2base64('/img/code?' + new Date().getTime()).then(
                (response) => {
                    img.src = 'data:image/jpg;base64,' + response
                    //TODO:验证码识别
                }
            )
        }
    }

    this.read = function () {
        let timer = undefined;
        let slide = function () {
            if (document.body.getScrollHeight() - document.body.getHeight() <= document.documentElement.scrollTop + 40) {
                let next = $('.ml40.nodeItem.r');
                if (next.length <= 0) {
                    self.notice('看完啦~');
                    alert('看完啦~');
                } else {
                    next[0].click();
                }
                clearTimeout(timer);
                return;
            }
            document.body.scrollTop = document.documentElement.scrollTop = document.documentElement.scrollTop + common.randNumber(60, 80);
            timer = setTimeout(slide, common.randNumber(15, 25) * 1000);
        }
        slide();
    }

    this.notice = function (text) {
        let el = undefined;
        if ($(self.document.body).find('.prompt-line-cxmooc-notice').length > 0) {
            el = $(self.document.body).find('.prompt-line-cxmooc-notice')[0];
        } else {
            el = until.createLine(text, 'cxmooc-notice');
            $(el).css('text-align', 'center');
            $(self.document.body).prepend(el);
        }
        $(el).text(text);
    }

    return this;
}
