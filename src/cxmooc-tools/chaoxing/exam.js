const util = require('./util');
const common = require('../common');
const moocServer = require('../../config');

module.exports = {
    notic: undefined,
    getTopic: function () {
        let topic = $('.Cy_TItle.clearfix .clearfix');
        console.log('exam deal topic');
        if (topic.length <= 0) {
            this.notic.text('未搜索到题目');
            return undefined;
        }
        let text = common.removeHTML($(topic).html());
        text = text.substr(0, text.lastIndexOf('分)'));
        text = text.substr(0, text.lastIndexOf('('));
        return text;
    },
    exam: function () {
        //生成按钮
        let self = this;
        let btn = util.createBtn('搜索答案', '搜索题目答案');
        $('.Cy_ulBottom.clearfix.w-buttom,.Cy_ulTk,.Cy_ulBottom.clearfix').after(btn);
        btn.onclick = function () {
            //搜索答案
            self.notic = util.signleLine('搜索答案中...', 'answer', btn.parentElement);
            let topic = self.getTopic();
            if (topic == undefined) {
                return false;
            }
            console.log('request answer');
            common.gm_post(moocServer.url + 'v2/answer', 'topic[0]=' + topic, false, function (data) {
                let json = JSON.parse(data);
                if (json[0].result.length <= 0) {
                    return self.notic.text('未找到答案');
                }
                let answer = json[0].result[Math.floor(Math.random() * Math.floor(json[0].result.length))];
                //填充
                console.log(answer);
                self.fillAnswer(answer);
            }).error(function () {
                self.notic.text('网络错误');
            });
            return false;
        }
        if (config.auto) {
            btn.onclick();
        }
    },
    fillAnswer: function (answer) {
        let correct = answer.correct;
        switch (answer.type) {
            case 1:
            case 2: {
                let options = $('.Cy_ulBottom.clearfix.w-buttom li input');
                if (options.length <= 0) {
                    this.notic.text('答案搜索错误');
                    return false;
                }
                let noticText = '';
                $(options).removeAttr('checked');
                for (let i = 0; i < correct.length; i++) {
                    let index = (correct[i].option.charCodeAt() | 32) - 97;
                    $(options[index]).attr('checked', true);
                    noticText += correct[i].option + ':' + correct[i].content + '<br/>';
                }
                $(this.notic).html(noticText);
                break;
            }
            case 3: {
                let options = $('.Cy_ulBottom.clearfix li input');
                if (options.length <= 0) {
                    this.notic.text('答案搜索错误');
                    return false;
                }
                $(options).removeAttr('checked');
                let index = 1;
                if (correct[0].option) {
                    index = 0;
                }
                $(options[index]).attr('checked', true);
                $(this.notic).html('答案:'+correct[0].option);
                break;
            }
            case 4: {
                let options = $('.Cy_ulTk .XztiHover1');
                if (options.length <= 0) {
                    this.notic.text('答案搜索错误');
                    return false;
                }
                let notic = '';
                for (let i = 0; i < options.length; i++) {
                    let pos = common.substrEx($(options[i]).find('.fb.font14').text(), '第', '空');
                    for (let n = 0; n < correct.length; n++) {
                        if (correct[n].option == pos) {
                            notic += ' 第' + pos + '空:' + correct[n].content + '<br/>';
                            let ifDoc = $(options[i]).find('iframe');
                            if (ifDoc.length <= 0) {
                                this.notic.text('答案搜索错误');
                                return false;
                            }
                            ifDoc = ifDoc[0].contentDocument;
                            $(ifDoc.body).html('<p>' + correct[n].content + '</p>');
                            break;
                        }
                    }
                }
                $(this.notic).html(notic);
                break;
            }
            default: {
                this.notic.text('不支持的答案类型:' + JSON.stringify(correct));
                return false;
            }
        }
        return true;
    },
    collect: function () {
        let timu = $('.TiMu');
        let answer = [];
        for (let i = 0; i < timu.length; i++) {
            let topic = $(timu[i]).find('.Cy_TItle.clearfix .clearfix');
            if (topic.length <= 0) {
                console.log('跳过' + timu[i]);
                continue;
            }
            let correct = $(timu[i]).find('.Py_answer.clearfix');
            if ($(correct).text().indexOf('正确答案') >= 0) {
                correct = common.removeHTML($(correct).html());
            } else if ($(correct).find('dui').length > 0) {
                correct = common.removeHTML($(correct).html());
            } else {
                continue;
            }
            console.log(correct);
            let topicText = common.removeHTML(topic.html());
            topicText = topicText.substr(0, topicText.lastIndexOf('('));
            console.log(topicText);
            let options = $(timu[i]).find('.Cy_ulTop li');
            let pushOption = { topic: topicText, answer: [], correct: [] };
            if (options.length <= 0) {
                //非选择
                let is = false;
                if ((is = correct.indexOf('√')) > 0 || correct.indexOf('×') > 0) {
                    if (is > 0) {
                        pushOption.correct.push({ option: true, content: true });
                    } else {
                        pushOption.correct.push({ option: false, content: false });
                    }
                } else {

                }
            } else {
                // console.log();
                let correctText = correct.match(/\w+/);
                if (correctText == null) {
                    continue;
                }
                correctText = correctText[0];
                console.log(correctText);
                for (let n = 0; n < options.length; n++) {
                    let option = $(options[n]).find('.fl').text().replace('、', '');
                    let tmp = {
                        option: $(options[n]).find('.fl').text().replace('、', ''),
                        content: common.removeHTML($(options[n]).find('.clearfix').html())
                    };
                    if (correctText.indexOf(option) >= 0) {
                        pushOption.correct.push(tmp);
                    }
                    pushOption.answer.push(tmp);
                }
            }
            answer.push(pushOption);
        }
        let box = util.pop_prompt("√  答案自动记录成功");
        $(document.body).append(box);
        setTimeout(function () { box.style.opacity = "1"; }, 500);
        console.log(answer);
        // common.gm_post(moocServer.url + 'answer', JSON.stringify(answer), true)
    }
};