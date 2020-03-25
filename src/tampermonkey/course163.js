// ==UserScript==
// @name         中国慕课小工具
// @namespace    https://github.com/CodFrm/cxmooc-tools
// @version      2.12
// @description  一个中国大学慕课刷课工具,火狐,谷歌,油猴支持.自动作业测试题库(੧ᐛ੭挂科模式,启动)
// @author       CodFrm
// @run-at       document-start
// @match        *://www.icourse163.org/learn/*
// @match        *://www.icourse163.org/spoc/learn/*
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @license      MIT
// ==/UserScript==

let config = {
    answer_ignore: false, //忽略题目,勾选此处将不会答题
    auto: true, //全自动挂机,无需手动操作,即可自动观看视频等
    rand_answer: false, //随机答案,没有答案的题目将自动的生成一个答案
    vtoken: "user", //鉴权token,用于验证码打码,提交题目可获得打码次数
};

Object.keys(config).forEach(k => {
    localStorage[k] = config[k];
});
