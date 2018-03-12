const common = require('./common');
const md5 = require("md5");
const moocServer = require('../config');
/**
 * 题目处理模块
 */
module.exports = function (_this, elLogo, index, over) {
    var doc = _this.contentDocument.getElementsByTagName('iframe')[index].contentDocument;
    var topicDoc = doc.getElementById('frame_content').contentDocument;
    var html = topicDoc.body.innerHTML;
    if (over) {
        //完成的提交答案
        dealHTMLTopic(html);
    } else {
        //未完成的填入答案
        var auto = common.createBtn('搜索答案');
        elLogo.appendChild(auto);
        auto.onclick = function () {
            var topicList = topicDoc.getElementsByClassName('Zy_TItle');
            var topic = [];
            for (let i = 0; i < topicList.length; i++) {
                var msg = getTopicMsg(topicList[i]);
                var md5Data = md5(msg.topic + msg.type.toString());
                topicList[i].id = md5Data;
                topic.push(md5Data);
            }
            var data = '';
            for (let i in topic) {
                data += 'topic[' + i + ']=' + topic[i] + '&';
            }
            common.get(moocServer.url + 'answer?' + data).onreadystatechange = function () {
                if (this.readyState == 4) {
                    if (this.status != 200) {
                        alert('未知错误');
                    } else {
                        var json = JSON.parse(this.responseText);
                        //填入答案
                        for (let i in json) {
                            fillIn(json[i].topic, json[i].result);
                        }
                    }
                }
            }
        }
    }

    function rand(min, max) {
        switch (arguments.length) {
            case 1:
                return parseInt(Math.random() * min + 1, 10);
                break;
            case 2:
                return parseInt(Math.random() * (max - min + 1) + min, 10);
                break;
            default:
                return 0;
                break;
        }
    }

    function fillIn(id, result) {
        var topicEl = topicDoc.getElementById(id);
        result = result[rand(0, result.length - 1)];
        for (let i = 0; i < result.correct.length; i++) {
            var options = topicEl.nextSibling.nextSibling.getElementsByTagName('li');
            for (let n = 0; n < options.length; n++) {
                var optionsContent;
                if (result.type == 3) {
                    if (result.correct[i].content) {
                        options[0].getElementsByTagName('input')[0].click();
                    } else {
                        options[1].getElementsByTagName('input')[0].click();
                    }
                    break;
                } else if (result.type <= 2) {
                    optionsContent = removeHTML(options[n].querySelector('.after').innerHTML);
                    if (result.correct[i].content == optionsContent) {
                        options[n].querySelector('.after').click();
                    }
                } else if (result.type == 4) {
                    optionsContent = common.substrEx(options[n].innerHTML, "第", "空");
                    if (optionsContent == result.correct[i].option) {
                        options[n].getElementsByTagName('input')[0].value = result.correct[i].content;
                    }
                }
            }
        }
    }

    /**
     * 获取题目信息
     * @param {*} elTopic 
     */
    function getTopicMsg(elTopic) {
        var msg = {};
        msg.topic = elTopic.querySelector('div.clearfix').innerHTML;
        msg.type = switchTopicType(common.substrEx(msg.topic, '【', '】'));
        msg.topic = removeHTML(msg.topic.substring(msg.topic.indexOf('】') + 1));
        return msg;
    }

    /** 
     * 处理html源码获取题目信息
     */
    function dealHTMLTopic(data) {
        var regx = /【(.*?)】([\s\S]*?)<\/div>([\S\s]*?)<div class="Py_answer clearfix">[\s\S]*?[正确答案：|我的答案：]([\s\S]*?)<i class="fr (.*?)"><\/i>/g;
        var result;
        var retJson = new Array();
        while (result = regx.exec(data)) {
            if (result.input.indexOf('<span>正确答案：') < 0) {
                if (result[5] != 'dui') {
                    continue;
                }
            }
            var tmpJson = dealTopicMsg(result);
            retJson.push(tmpJson);
        }
        //提交数据
        common.post(moocServer.url + 'answer', JSON.stringify(retJson));
    }
    /** 
     * 去除html标签
     */
    function removeHTML(html) {
        var revHtml = /<.*?>/g;
        html = html.replace(revHtml, '');
        html = html.replace(/(^\s+)|(\s+$)/g, '');
        return html.replace(/&nbsp;/g, ' ');
    }
    /**
     * 处理题目信息
     * @param {*} regxData 
     */
    function dealTopicMsg(regxData) {
        var msg = {};
        //去除html标签
        var revHtml = /<.*?>/g;
        msg.topic = removeHTML(regxData[2]);
        msg.type = switchTopicType(regxData[1]);
        if (msg.type == -1) {
            return null;
        }
        //处理答案块
        var result;
        var answers = [];
        var correct = [];
        if (msg.type <= 3) {
            //处理答案
            var answerRegx = /<i class="fl">(.*?)<\/i>[\s\S]*?style="word-break: break-all;text-decoration: none;">(.*?)<\/a>/g;
            regxData[4] = removeHTML(regxData[4].substring(0, regxData[4].indexOf('</span>')));
            if (msg.type == 3) {
                var pos = regxData[4].indexOf('：');
                if (pos >= 0) {
                    regxData[4] = regxData[4].substring(pos + 1, pos + 2);
                }
                regxData[4] = (regxData[4] == '×' ? false : true)
                correct = [{
                    option: regxData[4],
                    content: regxData[4]
                }]
            } else {
                while (result = answerRegx.exec(regxData[3])) {
                    var option = result[1].substring(0, 1);
                    var answer = {
                        option: option,
                        content: removeHTML(result[2])
                    };
                    if (regxData[4].indexOf(option) >= 0) {
                        correct.push(answer);
                    }
                    answers.push(answer);
                }
            }
        } else if (msg.type == 4) {
            var answerRegx = /第(.*?)空[\s\S]*?<div class="clearfix">([\s\S]*?)</g;
            regxData[4] += '<';
            while (result = answerRegx.exec(regxData[4] + '<')) {
                correct.push({
                    option: result[1],
                    content: removeHTML(result[2])
                });
            }
        }
        msg.answers = answers;
        msg.correct = correct;
        return msg;
    }

    function switchTopicType(typeTtile) {
        var type = typeTtile;
        switch (type) {
            case '单选题':
                {
                    type = 1;
                    break;
                }
            case '多选题':
                {
                    type = 2;
                    break;
                }
            case '判断题':
                {
                    type = 3;
                    break;
                }
            case '填空题':
                {
                    type = 4;
                    break;
                }
            default:
                {
                    type = -1;
                    break;
                }
        }
        return type;
    }
    return this;
}