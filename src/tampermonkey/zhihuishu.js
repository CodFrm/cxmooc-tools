// ==UserScript==
// @name         智慧树小工具
// @namespace    https://github.com/CodFrm/cxmooc-tools
// @version 2.0.7
// @description  一个知到智慧树的小工具,火狐,谷歌,油猴支持.支持视频倍速秒过,屏蔽题目,测试题库(੧ᐛ੭挂科模式,启动)
// @author       CodFrm
// @run-at       document-start
// @match        *://study.zhihuishu.com/learning/videoList*
// @match        *://studyh5.zhihuishu.com/videoStudy.html*
// @match        *://examh5.zhihuishu.com/stuExamWeb.html*
// @match        *://onlineexamh5new.zhihuishu.com/stuExamWeb.html*
// @grant        GM_xmlhttpRequest
// @grant        GM_notification
// @grant        unsafeWindow
// @license      MIT
// ==/UserScript==

let config = {
    auto: true, //全自动挂机,无需手动操作,即可自动观看视频等
    interval: 1, //时间间隔,当任务点完成后,会等待1分钟然后跳转到下一个任务点
    rand_answer: false, //随机答案,没有答案的题目将自动的生成一个答案
    video_multiple: 1, //视频播放倍速,视频播放的倍数,建议不要改动,为1即可,这是危险的功能
    video_mute: true, //视频静音,视频自动静音播放
    super_mode: true,//超级模式,让倍速成真
    topic_interval: 5,//题目答题间隔,单位为秒
    vtoken: "",
};

Object.keys(config).forEach(k => {
    localStorage[k] = config[k];
});
