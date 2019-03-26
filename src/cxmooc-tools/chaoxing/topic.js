const common = require('../common');
const until = require('./until');
const moocServer = require('../../config');

module.exports = function () {
    let self = this;
    this.iframe = undefined;
    this.document = undefined;
    this.complete = undefined;
    this.loadover = undefined;
    this.topicBtn = undefined;
    this.pause = true;

    this.searchAnswer = function () {
        if (self.pause) {
            self.pause = false;
            config.auto && $(self.topicBtn).text('暂停挂机');
        } else {
            self.pause = true;
            $(self.topicBtn).text('搜索题目');
            return;
        }
        let TiMu = $(self.document).find('.Zy_TItle.clearfix');
        let topic = [];
        for (let i = 0; i < TiMu.length; i++) {
            topic.push(dealTopicInfo(TiMu[i]));
        }
        let data = '';
        for (let i in topic) {
            data += 'topic[' + i + ']=' + topic[i].topic + '&type[' + i + ']=' + topic[i].type + '&';
        }
        common.post(moocServer.url + 'v2/answer', data, false, function (data) {
            let json = JSON.parse(data);
            let answer_null = false;
            for (let i = 0; i < json.length; i++) {
                if (fillTopic(TiMu, json[i], topic) == false) {
                    answer_null = true;
                }
            }
            if (answer_null) {
                alert('有题目没有找到答案,并且未设置随机答案,请手动填入');
                return;
            }
            if (config.auto) {
                self.complete(1);
            } else {
                self.complete();
            }
        });
    }


    this.pushTopic = function () {
        if (self.pause) {
            return;
        }
        //提交操作
        let confirm = function () {
            let prompt = $(self.document).find('#tipContent').text();
            if (prompt.indexOf('未做完') > 0) {
                alert('提示:' + prompt);
                return;
            }
            prompt = document.getElementById('validate');
            if (prompt.style.display != 'none') {
                if (!show) {
                    show = true;
                    alert('需要输入验证码');
                }
                return;
            }
            //确定提交
            let submit = $(self.document).find('.bluebtn');
            submit[0].click();
        }
        let submit = function () {
            let submit = $(self.document).find('.Btn_blue_1');
            submit[0].click();
            setTimeout(confirm, 2000);
        }
        setTimeout(submit, 1000);
        //判断有没有未填的题目
    }


    /**
     * 创建按钮
     */
    this.createButton = function () {
        self.topicBtn = until.createBtn('搜索题目', '点击自动从网络上的题库中查找答案');
        let prev = $(self.iframe).prev();
        if (prev.length <= 0) {
            prev = $(self.iframe).parent();
            $(prev).prepend(self.topicBtn);
        } else {
            $(prev).append(self.topicBtn);
        }
        until.dealTaskLabel(prev);
        self.topicBtn.onclick = self.searchAnswer;
    }

    this.init = function () {
        self.document = $(self.iframe.contentDocument).find('#frame_content')[0].contentDocument;
        listenIframe();
        reloadInit() && self.loadover && self.loadover(self);
    }

    function reloadInit() {
        if (until.isFinished(self.iframe)) {
            self.collect();
        } else {
            self.createButton();
            return true;
        }
        return false;
    }

    //监听框架,跳转抓取题目
    function listenIframe() {
        $($(self.iframe.contentDocument).find('#frame_content')[0]).on("load", function () {
            self.document = this.contentDocument;
            reloadInit();
        });
    }

    this.start = function () {
        self.searchAnswer();
    }

    /**
     * 收集题目
     */
    this.collect = function () {
        let TiMu = $(self.document).find('.TiMu');
        let answer = [];
        for (let i = 0; i < TiMu.length; i++) {
            let tmp = getAnswerInfo(TiMu[i]);
            if (tmp == {}) {
                continue;
            }
            answer.push(tmp);
        }
        let box = until.pop_prompt("√  答案自动记录成功");
        $(document.body).append(box);
        setTimeout(function () { box.style.opacity = "1"; }, 500);
        common.post(moocServer.url + 'answer', JSON.stringify(answer));
        self.complete(2);
    }
    return this;
}

/**
 * 获取题目信息
 * @param {*} TiMu 
 */
function getAnswerInfo(TiMu) {
    let answer = $(TiMu).find('.Zy_TItle.clearfix');
    let correct = $(TiMu).find('.Py_answer.clearfix');
    if (correct.length <= 0) {
        return {};
    }
    if ($(correct).html().indexOf('正确答案') < 0) {
        if ($(correct).find('.fr.dui').length <= 0 || $(correct).find('.fr.bandui').length) {
            return {};
        }
    }
    //验证正确
    let title = $(answer).find('.clearfix');
    let type = switchTopicType(common.substrEx(title.text(), '【', '】'));
    let topic = common.removeHTML(title.html().substring(title.html().indexOf('】') + 1));
    let options = $(TiMu).find('.Zy_ulTop .clearfix');
    let ret = {
        answers: [],
        correct: []
    };
    let tmpAnswer = $(correct).find('span')[0];
    tmpAnswer = $(tmpAnswer).text();
    switch (type) {
        case 1: case 2: {
            for (let i = 0; i < options.length; i++) {
                let option = $(options[i]).find('i.fl').text().substring(0, 1);
                let tmp = { option: option, content: common.removeHTML($(options[i]).find('a.fl').text()) };
                ret.answers.push(tmp);
                if (tmpAnswer.indexOf(option) > 0) {
                    ret.correct.push(tmp);
                }
            }
            break;
        } case 3: {
            if (tmpAnswer.indexOf('×') >= 0) {
                ret.correct.push({ option: false, content: false });
            } else {
                ret.correct.push({ option: true, content: true });
            }
            break;
        } case 4: {
            let isMy = false;
            options = $(TiMu).find('.Py_tk span.font14');
            if (options.length <= 0) {
                isMy = true;
                options = $(TiMu).find('.Py_answer.clearfix');
            }
            for (let i = 0; i < options.length; i++) {
                if (isMy) {
                    if ($(options[i]).find('.fr.dui').length <= 0) {
                        continue;
                    }
                }
                let option = $(options[i]).find('i.fl').text();
                option = common.substrEx(option, "第", "空");
                let content = $(options[i]).find('.clearfix').text();
                ret.correct.push({ option: option, content: common.removeHTML(content) });
            }
            break;
        }
    }
    ret.topic = topic;
    ret.type = type;
    return ret;
}

/**
 * 处理题目信息
 * @param {*} elTopic 
 */
function dealTopicInfo(elTopic) {
    let msg = {};
    let topic = $(elTopic).find('div.clearfix');
    if (topic.length <= 0) {
        console.log(elTopic);
        return msg;
    }
    msg.topic = topic[0].innerHTML;
    msg.type = switchTopicType(common.substrEx(msg.topic, '【', '】'));
    msg.topic = common.removeHTML(msg.topic.substring(msg.topic.indexOf('】') + 1));
    return msg;
}

/**
  * 题目类型
  * @param {*} typeTtile 
  */
function switchTopicType(typeTtile) {
    let type = typeTtile;
    switch (type) {
        case '单选题': {
            type = 1;
            break;
        }
        case '多选题': {
            type = 2;
            break;
        }
        case '判断题': {
            type = 3;
            break;
        }
        case '填空题': {
            type = 4;
            break;
        }
        default: {
            type = -1;
            break;
        }
    }
    return type;
}

/**
 * 填充题目答案
 */
function fillTopic(TiMu, answer, sourceTopic) {
    let rand = false;
    let optionEl = $(TiMu[answer.index]).next();
    $(optionEl).next().find('p').remove();
    let result = selectAnswer(answer.result, sourceTopic[answer.index]);
    if (result.length <= 0) {
        if (config.rand_answer == true) {
            result = genRandAnswer(sourceTopic[answer.index].type);
            rand = true;
        } else {
            until.createLine('没有答案', 'answer', $(optionEl).next());
            return false;
        }
        if (result.correct.length <= 0) {
            until.createLine('不支持的随机答案类型', 'answer', $(optionEl).next());
            return false;
        } else {
            until.createLine('这是随机生成的答案', 'answer', $(optionEl).next());
        }
    }
    let options = {}
    switch (result.type) {
        case 1: case 2: case 3: {
            options = $(optionEl).find('label>input');
            break;
        }
        case 4: {
            options = $(optionEl).find('li');
        }
    }
    for (let i = 0; i < result.correct.length; i++) {
        switch (result.type) {
            case 1: case 2: {
                for (let n = 0; n < options.length; n++) {
                    let content = $(options[n]).parent().next()[0];
                    if (options[n].value == result.correct[i].option ||
                        common.removeHTML($(content).text()) == result.correct[i].content
                    ) {
                        if (!$(options[n]).attr('checked')) {
                            options[n].click();
                        }
                        until.createLine(options[n].value + ':' + $(content).text(), 'answer', $(optionEl).next());
                        options.splice(n, 1);
                        break;
                    } else if ($(options[n]).attr('checked')) {
                        options[n].click();
                    }
                }
                break;
            }
            case 3: {
                if (result.correct[0].option) {
                    options[0].click();
                    until.createLine('对√', 'answer', $(optionEl).next());
                } else {
                    options[1].click();
                    until.createLine('错×', 'answer', $(optionEl).next());
                }
                break;
            }
            case 4: {
                for (let n = 0; n < options.length; n++) {
                    if (common.substrEx(options[n].innerText, '第', '空') == result.correct[i].option) {
                        $(options[n]).find('.inp').val(result.correct[i].content);
                        until.createLine(options[n].innerText + ':' + result.correct[i].content, 'answer', $(optionEl).next());
                        options.splice(n, 1);
                        break;
                    }
                }
                break;
            }
            default: {
                until.createLine('不支持的类型', 'answer', $(optionEl).next());
                break;
            }
        }
    }
    return true;
}

/**
 * 生成随机答案
 */
function genRandAnswer(type) {
    let ret = { correct: [], type: type };
    if (type == 1) {
        ret.correct.push({ option: String.fromCharCode(65 + common.randNumber(0, 3)), content: '' });
    } else if (type == 2) {
        let list = ['A', 'B', 'C', 'D'];
        let len = common.randNumber(2, 4);
        for (let i = 0; i < len; i++) {
            let pos = common.randNumber(0, list.length - 1);
            ret.correct.push({ option: list[pos], content: '' });
            list.splice(pos, 1);
        }
    } else if (type == 3) {
        let answer = common.randNumber(0, 1) == 0 ? false : true;
        ret.correct.push({ option: answer, content: answer });
    }
    return ret;
}

/**
 * 选择题目
 * @param {*} answers 
 * @param {*} oldTopic 
 */
function selectAnswer(answers, oldTopic) {
    for (let i = 0; i < answers.length; i++) {
        if (answers[i].type == oldTopic.type) {
            return answers[i];
        }
    }
    return [];
}