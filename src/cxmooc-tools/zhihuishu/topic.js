const css = require('../html/common.css');
const common = require('../common');

module.exports = {
    btn: undefined,
    stuExam: function () {
        let self = this;
        let timer = setInterval(function () {
            let ul = $('.examPaper_partTit.mt20 ul');
            if (ul.length <= 0) {
                return;
            }
            if ($('.examInfo.infoList.clearfix').length > 0) {
                //答案采集
                self.collect();
            } else {
                self.btn = $(ul).append($('<li><button class="zhs-search-answer green">搜索答案</button></li>')).find('button');
                $(self.btn).click(() => { self.searchAnswer() });
            }
            clearInterval(timer);
        }, 2000);
    },
    getTopicList: function () {
        let topic = $('.examPaper_subject.mt20,.questionType');
        let ret = [];
        for (let i = 0; i < topic.length; i++) {
            let text = common.removeHTML($(topic[i]).find('.subject_stem.clearfix,.subject_type_describe').html());
            let type = common.switchTopicType(common.substrEx(text, '【', '】'));
            let options = $(topic[i]).find('.subject_node.mt10,.subject_node');
            if (type == -1) {
                common.signleLine('暂不支持的类型', 'answer' + i, undefined, topic.options);
                continue;
            }
            text = text.substr(text.indexOf(') ') + ') '.length);
            ret.push({
                topic: text,
                type: type,
                options: options,
                index: i,
                el: topic[i],
            });
        }
        return ret;
    },
    findOption: function (options, type) {
        if (type <= 3) {
            return $(options).find('.examquestions-answer');
        } else if (type == 4) {
            return $(options).find('textarea');
        }
    },
    isTrue: function (options, correct, type) {
        if (type <= 2) {
            for (let i = 0; i < options.length; i++) {
                let tmpContent = common.removeHTML($(options[i]).html());
                if (tmpContent == correct.content) {
                    $(options[i]).parent().find('input').click();
                    return $(options[i]).prev().text();
                }
            }
        }
        return false;
    },
    searchAnswer: function () {
        let self = this;
        let topic = this.getTopicList();
        $(self.btn).text('搜索中...');
        common.requestAnswer(topic, 'zhs', 0,
            function (topic, answer) {
                let index = topic.index;
                if (answer == undefined) {
                    common.signleLine('无答案', 'answer' + index, undefined, topic.options);
                    return;
                }
                //填写答案
                let text = common.fillAnswer(topic, answer, {
                    select: (options, correct) => {
                        $(options).parent().find('input').removeAttr('checked');
                        return common.fillSelect(options, correct, self.isTrue);
                    },
                    judge: (options, correct) => {
                        correct = correct[0];
                        common.oaForEach(options, function (item) {
                            let tmpContent = common.removeHTML($(item).html());
                            if ({ '对': true, '错': false }[tmpContent] == correct.option) {
                                $(item).parent().find('input').click();
                                return true;
                            }
                        });
                        return '答案:' + correct.option;
                    },
                    text: (options, correct) => {
                        let retNotic = '';
                        common.oaForEach(options, function (item, index) {
                            common.oaForEach(correct, function (item2) {
                                if (common.numToZh(index + 1) == item2.option) {
                                    $(item).val(item2.content);
                                    retNotic += '第' + item2.option + '空:' + item2.content + '<br/>';
                                }
                            });
                        });
                        return retNotic;
                    },
                    other: () => { return '暂不支持的类型'; }
                }, self.findOption);
                if (text == '') {
                    return common.signleLine('没有合适的答案', 'answer' + index, undefined, topic.options);;
                }
                common.signleLine(text, 'answer' + index, undefined, topic.options[topic.options.length - 1]);
            },
            () => { $(self.btn).text('搜索完成'); },
            () => { $(self.btn).text('网络错误'); },
        );

    },
    collect: function () {
        let self = this;
        let topic = this.getTopicList();
        common.postAnswer(topic, 'zhs', function (topic) {
            if ($(topic.el).find('.key_yes').length <= 0) {
                return undefined;
            }
            let pushOption = { topic: topic.topic, type: topic.type, answers: [], correct: [] };
            let options = self.findOption(topic.options, topic.type);
            switch (topic.type) {
                case 1:
                case 2: {
                    for (let i = 0; i < options.length; i++) {
                        let tmpContent = common.removeHTML($(options[i]).html());
                        let tmp = {
                            option: String.fromCharCode((65 + i)),
                            content: tmpContent
                        };
                        pushOption.answers.push(tmp);
                        if ($(options[i]).parent().find('input').attr('checked')) {
                            pushOption.correct.push(tmp);
                        }
                    }
                    break;
                }
                case 3: {
                    for (let i = 0; i < options.length; i++) {
                        let tmpContent = common.removeHTML($(options[i]).html());
                        if ($(options[i]).parent().find('input').attr('checked')) {
                            pushOption.correct.push({ option: tmpContent == '对', content: tmpContent == '对' });
                        }
                    }
                    break;
                }
                case 4: {
                    return undefined;
                }
            }
            return pushOption;
        }, function (res) {
            let json = JSON.parse(res)
            let box = common.pop_prompt("√  答案自动记录成功" + " 成功获得:" + json.add_token_num + "个打码数量 剩余数量:" + json.token_num);
            $(document.body).append(box);
            setTimeout(function () { box.style.opacity = "1"; }, 500);
        });
    }
}