// import {
//     showExpand,
//     removeHTML,
//     get,
//     getLocalTopic,
//     removeinjected,
// } from './common';
// const md5 = require("md5");
// const moocServer = require('../config');
const common = require('./common');
const chaoxing = require('./chaoxing/chaoxing');

common.removeinjected(document);
global.config = JSON.parse(localStorage['config']);
global.timer=new Array();
if (window.location.href.indexOf('mycourse/studentstudy?') > 0) {
    //超星学习页面
    document.addEventListener('load', function (ev) {
        var ev = ev || event;
        var _this = ev.srcElement || ev.target;
        if (_this.id == 'iframe') {
            factory('chaoxing').studentstudy();
        }
    }, true);
    var frame = document.getElementById('iframe');
    if (frame != null) {
        factory('chaoxing').studentstudy();
    }
}else if(window.location.href.indexOf('ztnodedetailcontroller/visitnodedetail') > 0){
    //超星阅读页面
    factory('chaoxing').read();
}

/**
 * 工厂
 * @param {string} object 
 * @return plugin
 */
function factory(object) {
    switch (object) {
        case 'chaoxing': {
            return new chaoxing();
        }
    }
}


// //监听框架加载
// document.addEventListener('load', function (ev) {
//     var ev = ev || event;
//     var _this = ev.srcElement || ev.target;
//     if (_this.id == 'iframe') {
//         showExpand(_this);
//     }
// }, true);
// //监测框架
// var frame = document.getElementById('iframe');
// if (frame != null) {
//     showExpand(frame);
// }
// //监测作业板块
// if (window.location.href.indexOf('work/doHomeWorkNew') > 0) {
//     var form = document.getElementById('form1');
//     if (form != null) {
//         //显示答题按钮
//         const topic = require('./topic');
//         topic(document, form.previousElementSibling, 0, false);
//     }
// }

// if (window.location.href.indexOf('work/selectWorkQuestionYiPiYue') > 0) {
//     var form = document.getElementById('ZyBottom');
//     if (form != null) {
//         //显示答题按钮
//         const topic = require('./topic');
//         topic(document, form.previousElementSibling, 0, true);
//     }
// }

// //考试
// if (window.location.href.indexOf('exam/test/reVersionTestStartNew') > 0) {
//     //读取题目和答案
//     var config = JSON.parse(localStorage['config']);
//     var topic = document.getElementById('position${velocityCount}').getElementsByClassName('clearfix')[0];
//     var prompt = document.createElement('div');
//     prompt.style.color = "#e53935";
//     prompt.className = "prompt";
//     document.getElementsByTagName('form')[0].appendChild(prompt);
//     var netReq;
//     if (config['blurry_answer']) {
//         topic = dealTopic(topic);
//         netReq = common.post(moocServer.url + 'v2/answer', 'topic[0]=' + topic, false);
//     } else {
//         topic = md5(dealTopic(topic));
//         netReq = get(moocServer.url + 'answer?topic[0]=' + md5(topic));
//     }
//     netReq.onreadystatechange = function () {
//         if (this.readyState == 4) {
//             if (this.status != 200) {
//                 prompt.innerText = '网络错误';
//             } else {
//                 var json = JSON.parse(this.responseText);
//                 if (json[0].result.length <= 0) {
//                     prompt.innerText = '没有搜索到答案,尝试从题库中查询';
//                     //从本地题库读取内容
//                     var localTopic = getLocalTopic(topic);
//                     if (localTopic != undefined) {
//                         //检索到题目了
//                         var tmpResult = {
//                             correct: []
//                         };
//                         //类型判断
//                         if (/^[\w]+$/.test(localTopic.answer)) {
//                             tmpResult.type = 2;
//                         } else if (/^[√|×]$/) {
//                             tmpResult.type = 3;
//                         } else {
//                             tmpResult.type = 4;
//                         }
//                         if (tmpResult.type == 3) {
//                             //判断题
//                             tmpResult.correct.push({
//                                 content: (localTopic.answer == '√' ? true : false)
//                             });
//                         } else if (tmpResult.type <= 2) {
//                             //单/多选
//                             var reg = /[\w]/g;
//                             var match = localTopic.answer.match(reg);
//                             if (match != undefined) {
//                                 for (var i = 0; i < match.length; i++) {
//                                     tmpResult.correct.push({
//                                         option: match[i]
//                                     });
//                                 }
//                             }
//                         } else if (tmpResult.type == 4) {
//                             //填空题,暂时空一下

//                         }
//                         if (tmpResult.correct.length > 0) {
//                             json[0].result.push(tmpResult);
//                             prompt.innerHTML = "成功的从本地题库搜索到答案:<br />" + localTopic.content + "<br/>答案:" + localTopic.answer + "<br/>";
//                         } else {
//                             prompt.innerHTML += "<br />题库中无该题答案";
//                         }
//                     } else {
//                         prompt.innerHTML += "<br />题库中无该题答案";
//                     }
//                 } else {
//                     prompt.innerHTML += "搜索成功,答案:";
//                 }

//                 switch (json["0"].result["0"].type) {
//                     case 1:
//                     case 2:
//                         {
//                             var options = document.getElementsByClassName('Cy_ulTop')[0].getElementsByTagName('li');
//                             var answer = json["0"].result["0"].correct;
//                             //选择题
//                             for (let i = 0; i < answer.length; i++) {
//                                 console.log(options[answer[i].option.charCodeAt() - 65]);
//                                 if (options[answer[i].option.charCodeAt() - 65].className != 'Hover') {
//                                     options[answer[i].option.charCodeAt() - 65].click();
//                                 }
//                                 prompt.innerHTML += answer[i].option + '、' + answer[i].content + "  "
//                             }
//                             break;
//                         }
//                     case 3:
//                         {
//                             var options = document.getElementsByClassName('Cy_ulBottom')[0].getElementsByTagName('li');
//                             //判断题
//                             if (json["0"].result["0"].correct["0"].content == true) {
//                                 options[0].click();
//                             } else {
//                                 options[0].click();
//                             }
//                             break;
//                         }
//                     case 4:
//                         {
//                             //填空题
//                         }
//                 }

//             }
//         }
//     }
// }

// function dealTopic(topic) {
//     topic = removeHTML(topic.innerHTML);
//     var revHtml = /<[\s\S]*?>/g;
//     //处理分
//     topic = topic.replace(/\（[\S]+?分）/, '')
//     topic = topic.replace(revHtml, '').trim();
//     return topic
// }