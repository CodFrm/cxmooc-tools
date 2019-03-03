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
        common.dealTaskLabel(prev);
        $(prev).append(btn);
        btn.onclick = self.searchAnswer;
    }

    this.init = function (iframe) {
        self.iframe = iframe;
        self.document = $(iframe.contentDocument).find('#frame_content')[0].contentDocument;
        if ($(self.iframe).find('.ans-attach-ct.ans-job-finished').length > 0) {
            self.collect();
        } else {
            self.createButton();
        }
    }

    this.collect = function () {
        
    }

    return this;
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