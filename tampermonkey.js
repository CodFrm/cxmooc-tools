// ==UserScript==
// @name         cxmooc-tools
// @namespace    https://github.com/CodFrm/cxmooc-tools
// @version      1.0
// @description  超星慕课小工具
// @author       CodFrm
// @match        *://*/mycourse/studentstudy?*
// @match        "*://*/ztnodedetailcontroller/visitnodedetail?*"
// @grant        nne
// ==/UserScript==

let config = {
    answer_ignore: true,    //忽略题目
    auto: true,              //全自动挂机
    interval: "5",           //时间间隔
    rand_answer: true,       //随机答案
    video_multiple: "1",     //视频播放倍速
    video_mute: true,        //视频静音
};
localStorage['config'] = JSON.stringify(config);

