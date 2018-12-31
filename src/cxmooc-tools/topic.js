const common = require('./common');
const md5 = require("md5");
const moocServer = require('../config');
/**
 * 题目处理模块
 */
module.exports = function (_this, elLogo, index, over) {
    var doc, topicDoc;
    if (_this.id == 'iframe') {
        doc = _this.contentDocument.getElementsByTagName('iframe')[index].contentDocument;
        topicDoc = doc.getElementById('frame_content').contentDocument;
    } else {
        doc = _this;
        topicDoc = _this;
    }
    var config = JSON.parse(localStorage['config']);
    if (over || (config['auto'] && config['answer_ignore'])) {
        //完成的提交答案
        var auto = common.createBtn('下一个');
        auto.id = 'action-btn';
        elLogo.appendChild(auto);
        auto.onclick = function () {
            //进入下一个
            if (!config['auto']) {
                nextTask();
            }
            setTimeout(function () {
                nextTask();
            }, 5000);
        }
        dealDocumentTopic(topicDoc);
    } else {
        //未完成的填入答案
        var auto = common.createBtn('搜索答案');
        auto.id = 'action-btn';
        elLogo.appendChild(auto);
        auto.onclick = function () {
            var topicList = topicDoc.getElementsByClassName('Zy_TItle');
            //分多段请求,每段10个请求
            for (let n = 0; n < topicList.length; n += 10) {
                var topic = [];
                for (let i = n; i < topicList.length && i - n < 10; i++) {
                    var msg = getTopicMsg(topicList[i]);
                    var md5Data;
                    if (config['blurry_answer']) {
                        var blurdeal = msg.topic;
                        blurdeal = blurdeal.replace(/[\s。（）\(\)\.]+$/, '');
                        md5Data = { topic: encodeURI(blurdeal), type: msg.type.toString() };
                    } else {
                        md5Data = md5(msg.topic + msg.type.toString());
                    }
                    topicList[i].id = 'answer_' + i.toString();
                    topic.push(md5Data);
                }
                var data = '';
                for (let i in topic) {
                    if (config['blurry_answer']) {
                        data += 'topic[' + i + ']=' + topic[i].topic + '&type[' + i + ']=' + topic[i].type + '&';
                    } else {
                        data += 'topic[' + i + ']=' + topic[i] + '&';
                    }
                }
                let show = false;
                var netReq;
                if (config['blurry_answer']) {
                    netReq = common.post(moocServer.url + 'v2/answer', data, false);
                } else {
                    netReq = common.get(moocServer.url + 'answer?' + data);
                }
                netReq.onreadystatechange = function () {
                    if (this.readyState == 4) {
                        if (this.status != 200) {
                            if (!show) {
                                show = true;
                                alert('未知错误');
                            }
                        } else {
                            var json = JSON.parse(this.responseText);
                            var answer_null = false;
                            //填入答案
                            for (let i in json) {
                                if (fillIn('answer_' + json[i].index, json[i].result == undefined ? [] : json[i].result) == 'null answer') {
                                    answer_null = true;
                                }
                            }
                            //如果是自动挂机,填入之后自动提交
                            if (!config['auto']) {
                                return;
                            }
                            if (answer_null) {
                                alert('有题目没有找到答案,并且未设置随机答案,请手动填入');
                                return;
                            }
                            setTimeout(function () {
                                //提交操作
                                var submit = topicDoc.getElementsByClassName('Btn_blue_1');
                                submit = submit[0];
                                submit.click();
                                //判断有没有未填的题目
                                setTimeout(function () {
                                    if (topicDoc.getElementById('tipContent').innerText.indexOf('未做完') > 0) {
                                        if (!show) {
                                            show = true;
                                            alert('提示:' + topicDoc.getElementById('tipContent').innerText);
                                        }
                                        return;
                                    }
                                    var tmp = document.getElementById('validate');
                                    if (tmp.style.display != 'none') {
                                        if (!show) {
                                            show = true;
                                            alert('需要输入验证码');
                                        }
                                        return;
                                    }
                                    //确定提交
                                    var submit = topicDoc.getElementsByClassName('bluebtn');
                                    submit[0].click();
                                    setTimeout(function () {
                                        // _this.contentDocument.getElementsByTagName('iframe')[index].contentWindow.location.reload();
                                        nextTask();
                                    }, 3000);
                                }, 3000);
                            }, config['interval'] * 1000 * 60);
                            console.log('timeout:' + config['interval'] * 1000 * 60);
                        }
                    }
                }
            }
        }
    }

    function nextTask() {
        //判断有没有下一个,自动进行下一个任务
        var ans = _this.contentDocument.getElementsByClassName('ans-job-icon');
        if (ans.length > index + 1) {
            //点击
            var nextAction = ans[index + 1].firstElementChild;
            nextAction.click();
        } else {
            //已经是最后一个,切换任务
            common.switchTask();
        }
    }

    /**
     * 用document方式提取题目
     */
    function dealDocumentTopic(doc) {
        var topic = doc.getElementsByClassName('TiMu');
        var retJson = new Array();
        for (var i = 0; i < topic.length; i++) {
            //题目标题块对象
            var titleDiv = topic[i].getElementsByClassName('Zy_TItle clearfix');
            if (titleDiv.length <= 0) {
                continue;
            }
            titleDiv = titleDiv[0];
            //题目标题对象
            var title = titleDiv.getElementsByClassName('clearfix');
            if (title.length <= 0) {
                continue;
            }
            title = title[0];
            //题目类型对象
            var type = title.getElementsByTagName('div');
            if (type.length <= 0) {
                continue;
            }
            type = type[0];
            //获取题目类型
            type = switchTopicType(common.substrEx(type.innerHTML, '【', '】'));
            if (type == -1) {
                continue;
            }
            //获取题目
            var tmpTitle = removeHTML(title.innerHTML.substring(title.innerHTML.indexOf('】') + 1));
            // title = title.getElementsByTagName('p');
            if (tmpTitle.length <= 0) {
                //题目获取失败,搜索里面有没有img,有那么title就为img的路径
                var img = title.getElementsByTagName('img');
                if (img == null) {
                    continue;
                }
                tmpTitle = img.getAttribute('src');
            }
            title = tmpTitle;
            //对答案进行处理
            var ret = dealDocumentAnswer(topic[i], type);
            if (ret != undefined) {
                ret.type = type;
                ret.topic = title;
                retJson.push(ret);
            }
            // msg.answers = answers;
            // msg.correct = correct;
            // console.log(type, title);
        }
        var box = common.pop_prompt("√  答案自动记录成功");
        document.body.appendChild(box);
        setTimeout(function () { box.style.opacity = "1"; }, 500);
        common.post(moocServer.url + 'answer', JSON.stringify(retJson));
    }

    function dealDocumentAnswer(topic, type) {
        var ret = {
            answers: [],
            correct: []
        };
        //然后看看有没有正确答案
        var answer = topic.getElementsByClassName('Py_tk');
        var answerSpan = undefined;
        if (answer.length <= 0) {
            //没有正确答案,搜索自己的答案,并判断是不是对的,否则返回空
            answer = topic.getElementsByClassName('Py_answer clearfix');
            if (answer.length <= 0) {
                return undefined;
            }
            if (answer[0].innerHTML.indexOf("正确答案") < 0) {
                if (answer[0].getElementsByClassName("dui").length <= 0) {
                    return undefined;
                }
            }
            answerSpan = answer[0].getElementsByTagName('span');
            if (answerSpan.length > 0) {
                answerSpan = answerSpan[0];
            }
        }
        answer = answer[0];
        //提取选项和答案到数据库结构
        // msg.answers = answers;
        // msg.correct = correct;
        if (type <= 2) {
            var options = topic.getElementsByClassName('Zy_ulTop');
            if (options.length >= 0) {
                options = options[0].getElementsByClassName('clearfix');
                for (var i = 0; i < options.length; i++) {
                    var option = options[i].getElementsByTagName('i');
                    if (option.length <= 0) {
                        continue;
                    }
                    var content = options[i].getElementsByTagName('a');
                    if (content.length <= 0) {
                        continue;
                    }
                    option = option[0];
                    content = content[0];
                    option = option.innerHTML.substring(0, 1);
                    var tmpJson = {
                        option: option,
                        content: removeHTML(content.innerHTML)
                    };
                    ret.answers.push(tmpJson);
                    //判断是否在其中
                    //选择题的正确答案和自己的答案都在一起,先判断有没有正确答案
                    if (answerSpan.innerHTML.indexOf(option) >= 0) {
                        ret.correct.push(tmpJson);
                    }
                }
            }
        } else if (type == 3) {
            var t = true;
            if (answerSpan.innerHTML.indexOf('×') >= 0) {
                t = false;
            }
            ret.correct.push({
                option: t,
                content: t
            });
        } else if (type == 4) {
            var options = answer.getElementsByTagName('div');
            if (options.length <= 0) {
                return undefined;
            }
            options = options[0].getElementsByClassName('font14');
            for (var i = 0; i < options.length; i++) {
                var option = options[i].getElementsByTagName('i');
                if (option.length <= 0) {
                    continue;
                }
                var content = options[i].getElementsByClassName('clearfix');
                if (content.length <= 0) {
                    continue;
                }
                option = option[0];
                content = content[0];
                option = common.substrEx(option.innerHTML, "第", "空");
                var tmpJson = {
                    option: option,
                    content: removeHTML(content.innerHTML)
                };
                // ret.answers.push(tmpJson);
                if (options[i].getElementsByClassName('dui').length > 0 || answerSpan == undefined) {
                    ret.correct.push(tmpJson);
                }
            }
        }
        return ret;
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
        var topicMsg = getTopicMsg(topicEl);
        var prompt = topicEl.nextSibling.nextSibling.getElementsByClassName('prompt');
        if (prompt.length <= 0) {
            prompt = document.createElement('div');
            prompt.style.color = "#e53935";
            prompt.className = "prompt";
            topicEl.nextSibling.nextSibling.appendChild(prompt);
        } else {
            prompt = prompt[0];
            prompt.style.color = "#e53935";
            prompt.innerHTML = '';
            prompt.style.fontWeight = 100;
        }
        if (topicMsg.topic == '') {
            prompt.innerHTML = '没有找到题目,什么鬼?';
            return;
        }
        var options = topicEl.nextSibling.nextSibling.getElementsByTagName('li');
        var rand = document.head.getAttribute('rand-answer');
        if (result.length <= 0) {
            //没有在线上检索到答案,先在检索本地题库
            //从本地题库读取内容
            var localTopic = getLocalTopic(topicMsg.topic);
            if (localTopic != undefined) {
                //检索到题目了
                var tmpResult = {
                    correct: []
                };
                tmpResult.type = topicMsg.type;
                if (tmpResult.type == 3) {
                    //判断题
                    tmpResult.correct.push({
                        content: (localTopic.answer == '√' ? true : false)
                    });
                } else if (tmpResult.type <= 2) {
                    //单/多选
                    var reg = /[\w]/g;
                    var match = localTopic.answer.match(reg);
                    for (var i = 0; i < match.length; i++) {
                        tmpResult.correct.push({
                            option: match[i]
                        });
                    }
                } else if (tmpResult.type == 4) {
                    //填空题,暂时空一下

                }
                if (tmpResult.correct.length > 0) {
                    result.push(tmpResult);
                    console.log(tmpResult);
                    prompt.innerHTML = "成功的从本地题库搜索到答案:<br />" + localTopic.content + "<br/>答案:" + localTopic.answer + "<br/>";
                }
            }
        }
        if (result.length <= 0) {
            //无答案,检索配置有没有设置随机答案....
            if (rand == 'false') {
                prompt.innerHTML = "没有从题库中获取到相应记录";
                return 'null answer';
            }
            prompt.style.fontWeight = 600;
            prompt.innerHTML = "请注意这是随机生成的答案!<br/>";
            rand = true;
            var tmpResult = {
                correct: []
            };
            tmpResult.type = topicMsg.type;
            var d = Math.floor(Math.random() * 10 + 1);
            //随机生成答案,有些混乱了....
            for (let n = 0; n < options.length; n++) {
                var optionsContent;
                if (tmpResult.type == 3) {
                    //判断题
                    if (d % 2 == 1) {
                        tmpResult.correct.push({
                            content: true
                        });
                    } else {
                        tmpResult.correct.push({
                            content: false
                        });
                    }
                    break;
                } else if (tmpResult.type <= 2) {
                    //单选题
                    var oc = options[n].querySelector('.after');
                    if (oc == null) {
                        continue;
                    }
                    optionsContent = removeHTML(oc.innerHTML);
                    if (tmpResult.type == 2) {
                        options[n].querySelector('input[type=checkbox]').checked = false;
                        //多选
                        d = Math.floor(Math.random() * 2 + 1);
                        if (d == 1) {
                            tmpResult.correct.push({
                                content: optionsContent
                            });
                        }
                        if (tmpResult.correct.length <= 0) {
                            if (n == d % options.length) {
                                tmpResult.correct.push({
                                    content: optionsContent
                                });
                            }
                        }
                    } else {
                        if (n == d % options.length) {
                            tmpResult.correct.push({
                                content: optionsContent
                            });
                        }
                    }
                } else {
                    //填空题啥的就不弄了
                    prompt.innerHTML = '不支持随机的题目类型';
                    return;
                }
            }
            result.push(tmpResult);
        }
        result = result[0];
        prompt.innerHTML += '答案:';
        for (let i = 0; i < result.correct.length; i++) {
            for (let n = 0; n < options.length; n++) {
                var optionsContent;
                if (result.type == 3) {
                    if (result.correct[i].content) {
                        prompt.innerHTML += '对 √';
                        options[0].getElementsByTagName('input')[0].click();
                    } else {
                        prompt.innerHTML += '错 ×';
                        options[1].getElementsByTagName('input')[0].click();
                    }
                    break;
                } else if (result.type <= 2) {
                    var oc = options[n].querySelector('.after');
                    if (oc == null) {
                        continue;
                    }
                    optionsContent = removeHTML(oc.innerHTML);
                    var option = options[n].querySelector("input").value;
                    //如果内容是空的,就看选项的
                    if (result.correct[i].content == optionsContent) {
                        prompt.innerHTML += optionsContent + "   ";
                        options[n].querySelector('.after').click();
                        var option = options[n].querySelector("input").value;
                    } else if (result.correct[i].option == option) {
                        prompt.innerHTML += optionsContent + "   ";
                        options[n].querySelector('.after').click();
                        var option = options[n].querySelector("input").value;
                    }
                } else if (result.type == 4) {
                    optionsContent = common.substrEx(options[n].innerHTML, "第", "空");
                    if (optionsContent == result.correct[i].option) {
                        prompt.innerHTML += "第" + optionsContent + "空:" + result.correct[i].content + "   ";
                        options[n].getElementsByTagName('input')[0].value = result.correct[i].content;
                    }
                }
            }
        }
    }

    /**
     * 获取本地题库中的信息
     * @param {*} topic 
     */
    function getLocalTopic(topic) {
        try {
            if (localStorage['topic_regx'] == undefined || localStorage['topic_regx'] == '') {
                return;
            }
            var reg = new RegExp(common.dealRegx(localStorage['topic_regx'], topic));
            console.log(reg);
            var str = localStorage['topics'];
            var arr = reg.exec(str);
            if (arr != null && arr.length >= 2) {
                return {
                    content: arr[0],
                    answer: arr[1]
                };
            }
        } catch (e) {

        }
        return;
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
     * 处理符号
     * @param {*} topic 
     */
    function dealSymbol(topic) {
        topic = topic.replace('，', ',');
        topic = topic.replace('（', '(');
        topic = topic.replace('）', ')');
        topic = topic.replace('？', '?');
        return topic;
    }
    /** 
     * 处理html源码获取题目信息
     */
    function dealHTMLTopic(data) {
        var regx = /【(.*?)】([\s\S]*?)<\/div>([\S\s]*?)<div class="Py_answer clearfix">[\s\S]*?[正确答案：|我的答案：]([\s\S]*?)<i class="fr (.*?)"><\/i>/g;
        var result;
        var retJson = new Array();
        while (result = regx.exec(data)) {
            //判断是不是有正确答案的显示,如果有正确答案,就处理正确答案
            //太难处理了,已切换成document的形式
            if (result.input.indexOf('<span>正确答案：') < 0) {
                if (result[5] != 'dui') {
                    continue;
                }
            }
            var tmpJson = dealTopicMsg(result);
            retJson.push(tmpJson);
            // var tmpJson = {};
            // if (result.input.indexOf('>正确答案：') > 0) {
            //     result[4] = result[3];
            // } else {
            //     if (result[5] != 'dui') {
            //         continue;
            //     }
            //     result[4] += '</div>';
            // }
            // tmpJson = dealTopicMsg(result);
            // retJson.push(tmpJson);
        }
        console.log(retJson);
        //提交数据
        common.post(moocServer.url + 'answer', JSON.stringify(retJson));
    }
    /** 
     * 去除html标签
     */
    function removeHTML(html) {
        //先处理img标签
        var imgReplace = /<img .*?src="(.*?)".*?>/g;
        html = html.replace(imgReplace, '$1');
        var revHtml = /<.*?>/g;
        html = html.replace(revHtml, '');
        html = html.replace(/(^\s+)|(\s+$)/g, '');
        html = dealSymbol(html);
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
        //外观文件的扩展名为(   )。
        //外观文件的扩展名为(   )。
        msg.answers = answers;
        msg.correct = correct;
        return msg;
    }

    /**
     * 题目类型
     * @param {*} typeTtile 
     */
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