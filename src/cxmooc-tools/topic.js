/**
 * 题目处理模块
 */

module.exports = function (_this, elLogo, index) {
    var doc = _this.contentDocument.getElementsByTagName('iframe')[index].contentDocument;
    var topicDoc = doc.getElementById('frame_content').contentDocument;
    var html = topicDoc.body.innerHTML;
    dealHTMLTopic(html);
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
        console.log(retJson);
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
                    regxData[4] = regxData[4].substring(pos+1, pos + 2);
                }
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