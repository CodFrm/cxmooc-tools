const common = require('../common');
const moocServer = require('../../config');
module.exports = function () {
    let self = this;
    this.iframe = undefined;
    this.document = undefined;
    this.complete = undefined;

    this.searchAnswer = function () {
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
            let json = JSON.parse('[{"topic":"对错","index":9,"result":[{"correct":[{"option":"D","content":"暗能量-成团分布"}],"type":1,"topic":"关于目前所知的暗物质和暗能量，以下性质的配对错误的是（）。","hash":"6d884d03524319c9ede7e2d673b77093","time":1528103256000},{"correct":[{"option":true,"content":true}],"type":3,"topic":"在现代和后现代时期,绝对正确或者绝对错误的知识是不存在的。()","hash":"8c7215fb54b29c632fd3691dc56db9a4","time":1543204403000},{"correct":[{"option":true,"content":true}],"type":3,"topic":"创意思考不大注重每一步的对错，批判思考坚持要求思维过程中的每个环节无误。( )","hash":"71c7d35a595d46309fc44e46c028ac37","time":1543292724000},{"correct":[{"option":"D","content":"一号"}],"type":1,"topic":"()的世界里只有对错,没有差不多的说法?","hash":"fab696e655477afe93d5770fe035ca22","time":1551287131000}]}]');
            // let json=JSON.parse(data);
            json.forEach(element => {
                fillTopic(TiMu, element, topic);
            });
        });
    }

    /**
     * 创建按钮
     */
    this.createButton = function () {
        let btn = common.createBtn('搜索题目', '点击自动从网络上的题库中查找答案');
        let prev = $(self.iframe).prev();
        if (prev.length <= 0) {
            prev = $(self.iframe).parent();
            $(prev).prepend(btn);
        } else {
            $(prev).append(btn);
        }
        common.dealTaskLabel(prev);
        btn.onclick = self.searchAnswer;
    }

    this.init = function (iframe) {
        self.iframe = iframe;
        self.document = $(iframe.contentDocument).find('#frame_content')[0].contentDocument;
        if ($(self.iframe).parents('.ans-attach-ct.ans-job-finished').length > 0) {
            self.collect();
        } else {
            self.createButton();
        }
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
        let box = common.pop_prompt("√  答案自动记录成功");
        $(document.body).append(box);
        setTimeout(function () { box.style.opacity = "1"; }, 500);
        common.post(moocServer.url + 'answer', JSON.stringify(answer));
        self.complete();
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
    let optionEl = $(TiMu[answer.index]).next();
    $(optionEl).next().find('p').remove();
    let result = selectAnswer(answer.result, sourceTopic[answer.index]);
    if (result.length <= 0) {
        $(optionEl).next().append(common.createLine('没有答案', 'answer'));
        return;
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
                    if (options[n].value == result.correct[i].option) {
                        if (!$(options[n]).attr('checked')) {
                            $(options[n]).click();
                        }
                        options.splice(n, 1);
                        break;
                    }
                }
                break;
            }
            case 3: {
                if (result.correct[0].option) {
                    options[0].click();
                } else {
                    options[1].click();
                }
                break;
            }
            case 4: {
                for (let n = 0; n < options.length; n++) {
                    if (common.substrEx(options[n].innerText, '第', '空') == result.correct[i].option) {
                        $(options[n]).find('.inp').val(result.correct[i].content);
                        options.splice(n, 1);
                        break;
                    }
                }
                break;
            }
            default: {
                $(optionEl).next().append(common.createLine('不支持的类型', 'answer'));
                break;
            }
        }
    }
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