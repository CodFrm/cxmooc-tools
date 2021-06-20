// ==UserScript==
// @name         超星慕课小工具
// @namespace    https://github.com/CodFrm/cxmooc-tools
// @version      2.10
// @description  一个超星慕课刷课工具,火狐,谷歌,油猴支持.全自动任务,视频倍速秒过,作业考试题库,验证码自动打码(੧ᐛ੭挂科模式,启动)
// @author       CodFrm
// @run-at       document-start
// @match        *://*/mycourse/studentstudy?*
// @match        *://*/ztnodedetailcontroller/visitnodedetail?*
// @match        *://*/antispiderShowVerify.ac*
// @match        *://*/html/processVerify.ac?*
// @match        *://*/exam/test/reVersionPaperMarkContentNew?*
// @match        *://*/exam/test/reVersionTestStartNew?*
// @match        *://*/work/selectWorkQuestionYiPiYue?*
// @match        *://*/work/doHomeWorkNew?*
// @match        *://*/ananas/modules/*/index.html?*
// @match        *://*/exam/test?*
// @match        *://*/course/*.html?*
// @grant        GM_xmlhttpRequest
// @grant        GM_notification
// @grant        unsafeWindow
// @license      MIT
// ==/UserScript==

let config = {
    answer_ignore: false, //忽略题目,勾选此处将不会答题
    auto: true, //全自动挂机,无需手动操作,即可自动观看视频等
    interval: 1, //时间间隔,当任务点完成后,会等待1分钟然后跳转到下一个任务点
    rand_answer: false, //随机答案,没有答案的题目将自动的生成一个答案
    video_multiple: 1, //视频播放倍速,视频播放的倍数,建议不要改动,为1即可,这是危险的功能
    video_mute: true, //视频静音,视频自动静音播放
    video_cdn: "公网1", //锁定视频播放源,为空为记录最后一次选中的源(公网1,公网2等)
    super_mode: true, //解锁flash弹幕视频等,详情请看文档
    topic_interval: 5,//题目答题间隔,单位为秒
    vtoken: "",
};

Object.keys(config).forEach(k => {
    localStorage[k] = config[k];
});
