const util = require('./util');
const common = require('../common');
const moocServer = require('../../config');
// const css = require('../html/common.css');

module.exports = {
    notic: undefined,
    getTopic: function () {
        let topic = $('.Cy_TItle.clearfix .clearfix');
        if (topic.length <= 0) {
            this.notic.text('未搜索到题目');
            return undefined;
        }
        let text = common.removeHTML($(topic).html());
        text = text.substr(0, text.lastIndexOf('分)'));
        text = text.substr(0, text.lastIndexOf('('));
        return text;
    },
    getHomeworkTopic: function () {
        let topic = $('.Zy_TItle.clearfix .clearfix');
        if (topic.length <= 0) {
            return undefined;
        }
        let ret = [];
        for (let i = 0; i < topic.length; i++) {
            let text = common.removeHTML($(topic[i]).html());
            let options = $(topic[i]).parent().next();
            let elClass = $(options).attr('class');
            let type = 0;
            if (elClass.indexOf('Zy_ulTk') >= 0 && /第.空/.test($(options).text())) {
                type = 4;
            } else if (elClass.indexOf('Zy_ulBottom') >= 0) {
                type = 3;
            } else if (elClass.indexOf('clearfix') >= 0) {
                //多选/单选
                type = $(options).find('[type="radio"]').length > 0 ? 1 : 2;
            } else {
                common.signleLine('暂不支持的类型', 'answer' + i, undefined, options);
                continue;
            }
            ret.push({
                index: i,
                topic: text,
                type: type,
                options: options
            });
        }
        return ret;
    },
    createBtn: function (className, after) {
        let btn = util.createBtn('搜索答案', '搜索题目答案');
        if (after == true) {
            $(className).after(btn);
        } else {
            $(className).append(btn);
        }
        return btn;
    },
    homework: function () {
        let self = this;
        let btn = self.createBtn('.CyTop');
        btn.onclick = function () {
            $(btn).text('搜索中...');
            //搜索答案
            let topic = self.getHomeworkTopic();
            if (topic == undefined) {
                return false;
            }
            common.requestAnswer(topic, 'cx', 0, function (topic, answer) {
                let index = topic.index;
                if (answer == undefined) {
                    common.signleLine('无答案', 'answer' + index, undefined, topic.options);
                    return;
                }
                self.fillHomeWorkAnswer(topic, answer);
            }, () => { $(btn).text('搜索完成'); },
                () => { $(btn).text('网络错误'); }
            );
            return false;
        }
    },
    fillHomeWorkAnswer: function (topic, answer) {
        let correct = answer.correct;
        switch (topic.type) {
            case 1:
            case 2: {
                let options = $(topic.options).find('li input');
                let noticText = this.fillSelect(options, correct);
                common.signleLine(noticText, 'answer' + topic.index, undefined, topic.options);
                break;
            }
            case 3: {
                let options = $(topic.options).find('input');
                this.fillJudge(options, correct);
                common.signleLine('答案:' + correct[0].option, 'answer' + topic.index, undefined, topic.options);
                break;
            }
            case 4: {
                let options = $(topic.options).find('input[type="text"]');
                let notic = '';
                for (let i = 0; i < options.length; i++) {
                    let pos = common.substrEx($(options[i]).parent().find('.red.fb.font14').text(), '第', '空');
                    for (let n = 0; n < correct.length; n++) {
                        if (correct[n].option == pos) {
                            notic += ' 第' + pos + '空:' + correct[n].content + '<br/>';
                            $(options[n]).val(correct[n].content);
                            break;
                        }
                    }
                }
                common.signleLine(notic, 'answer' + topic.index, undefined, topic.options);
                break;
            }
        }
    },
    exam: function () {
        let self = this;
        let btn = self.createBtn('.Cy_ulBottom.clearfix.w-buttom,.Cy_ulTk,.Cy_ulBottom.clearfix', true);
        btn.onclick = function () {
            //搜索答案
            self.notic = common.signleLine('搜索答案中...', 'answer', btn.parentElement);
            let topic = self.getTopic();
            if (topic == undefined) {
                return false;
            }
            common.gm_post(moocServer.url + 'v2/answer?platform=cx', 'topic[0]=' + topic, false, function (data) {
                let json = JSON.parse(data);
                if (json[0].result.length <= 0) {
                    return self.notic.text('未找到答案');
                }
                let answer = json[0].result[Math.floor(Math.random() * Math.floor(json[0].result.length))];
                //填充
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
    fillSelect: function (options, correct) {
        let noticText = '';
        $(options).removeAttr('checked');
        let optionContent = $('.Cy_ulTop.w-top li div');
        if (optionContent.length <= 0) {
            optionContent=[];
            for(let i=0;i<options.length;i++){
                optionContent.push($(options[i]).parents('li').find('a')[0]);
            }
            // optionContent = $(options).parents('li').find('a'); //顺序不知道为什么反了
        }
        for (let i = 0; i < correct.length; i++) {
            for (let n = 0; n < options.length; n++) {
                let content = common.removeHTML($(optionContent[n]).html());
                if (content == correct[i].content) {
                    $(options[n]).click();
                    noticText += correct[i].option + ':' + correct[i].content + '<br/>';
                    break;
                }
            }
        }
        return noticText || '没有符合的答案';
    },
    fillJudge: function (options, correct) {
        $(options).removeAttr('checked');
        let index = 1;
        if (correct[0].option) {
            index = 0;
        }
        // $(options[index]).attr('checked', true);
        $(options[index]).click();
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
                let noticText = this.fillSelect(options, correct);
                $(this.notic).html(noticText);
                break;
            }
            case 3: {
                let options = $('.Cy_ulBottom.clearfix li input');
                if (options.length <= 0) {
                    this.notic.text('答案搜索错误');
                    return false;
                }
                this.fillJudge(options, correct);
                $(this.notic).html('答案:' + correct[0].option);
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
                            var uedit = $(options[n]).find('textarea');
                            if (uedit.length <= 0) {
                                this.notic.text('答案搜索错误');
                                return false;
                            }
                            UE.getEditor(uedit.attr('name')).setContent(correct[n].content);
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
    collect: function (college_type) {
        let timu = $('.TiMu');
        let answer = [];
        for (let i = 0; i < timu.length; i++) {
            let topic = undefined;
            if (college_type == 'home') {
                topic = $(timu[i]).find('.Zy_TItle.clearfix .clearfix div:first-child');
            } else {
                topic = $(timu[i]).find('.Cy_TItle.clearfix .clearfix');
            }
            if (topic.length <= 0) {
                continue;
            }
            let correct = $(timu[i]).find('.Py_answer.clearfix,.Py_tk');
            if ($(correct).text().indexOf('正确答案') >= 0 ||
                $(correct).find('.dui').length > 0) {
                correct = common.removeHTML($(correct).find('span:first,p:first').html());
            } else {
                continue;
            }
            let topicText = common.removeHTML(topic.html());
            let options = undefined;
            if (college_type == 'home') {
                options = $(timu[i]).find('.Cy_ulTop li,.Zy_ulTop li');
            } else {
                options = $(timu[i]).find('.Cy_ulTop li');
                topicText = topicText.substr(0, topicText.lastIndexOf('('));
            }
            let pushOption = { topic: topicText, answers: [], correct: [] };
            if (options.length <= 0) {
                //非选择
                let is = false;
                if ((is = correct.indexOf('√')) > 0 || correct.indexOf('×') > 0) {
                    pushOption.correct.push({ option: (is > 0), content: (is > 0) });
                    pushOption.type = 3
                } else {
                    let options = undefined;
                    if (college_type == 'home') {
                        options = $(timu[i]).find('div.font14');
                    } else {
                        options = $(timu[i]).find('.Py_answer div:first .font14.clearfix');
                    }
                    for (let n = 0; n < options.length; n++) {
                        if ($(options[n]).find('.dui').length <= 0) {
                            continue;
                        }
                        let option = $(options[n]).find('.fb.fl').text();
                        if (option == null) {
                            break;
                        }
                        option = common.substrEx(option, '第', '空');
                        let content = undefined;
                        if (college_type == 'home') {
                            content = $(options[n]).find('div.clearfix').html();
                        } else {
                            content = $(options[n]).find('div.fl').html();
                        }
                        pushOption.correct.push({ option: option, content: common.removeHTML(content) });
                    }
                    pushOption.type = 4;
                }
            } else {
                let correctText = correct.match(/\w+/);
                if (correctText == null) {
                    continue;
                }
                correctText = correctText[0];
                for (let n = 0; n < options.length; n++) {
                    let option = $(options[n]).find('.fl:first-child').text().replace('、', '');
                    let tmp = {
                        option: option,
                        content: common.removeHTML($(options[n]).find('.clearfix,.fl:last-child').html())
                    };
                    if (correctText.indexOf(option) >= 0) {
                        pushOption.correct.push(tmp);
                    }
                    pushOption.answers.push(tmp);
                }
                pushOption.type = correctText.length <= 1 ? 1 : 2;
            }
            answer.push(pushOption);
        }
        // console.log(answer);
        common.gm_post(moocServer.url + 'answer?platform=cx', JSON.stringify(answer), true, function () {
            let box = common.pop_prompt("√  答案自动记录成功");
            $(document.body).append(box);
            setTimeout(function () { box.style.opacity = "1"; }, 500);
        });
    }
};