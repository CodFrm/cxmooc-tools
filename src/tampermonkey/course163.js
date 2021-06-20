// ==UserScript==
// @name         中国大学慕课小工具
// @namespace    https://github.com/CodFrm/cxmooc-tools
// @version      2.2.0
// @description  一个中国大学mooc刷课工具,火狐,谷歌,油猴支持.支持自动观看视频/课件/讨论,屏蔽视频题目和静音倍速,作业/测试题库,考试题库,SCOP课程(੧ᐛ੭挂科模式,启动)
// @author       CodFrm
// @run-at       document-start
// @match        *://www.icourse163.org/learn/*
// @match        *://www.icourse163.org/spoc/learn/*
// @grant        GM_xmlhttpRequest
// @grant        GM_notification
// @grant        CAT_click
// @grant        unsafeWindow
// @license      MIT
// ==/UserScript==

let config = {
    answer_ignore: false, //忽略题目,勾选此处将不会答题
    auto: true, //全自动挂机,无需手动操作,即可自动观看视频等
    rand_answer: false, //随机答案,没有答案的题目将自动的生成一个答案
    interval: 1, //时间间隔,当任务点完成后,会等待1分钟然后跳转到下一个任务点
    video_multiple: 1, //视频播放倍速,视频播放的倍数,建议不要改动,为1即可,这是危险的功能
    video_mute: true, //视频静音,视频自动静音播放
    topic_interval: 5,//题目答题间隔,单位为秒
    vtoken: "",
};

Object.keys(config).forEach(k => {
    localStorage[k] = config[k];
});
