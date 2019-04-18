// ==UserScript==
// @name         智慧树小工具
// @namespace    https://github.com/CodFrm/cxmooc-tools
// @version 2.0.7
// @description  一个智慧树的小工具,火狐,谷歌,油猴支持.(੧ᐛ੭挂科模式,启动)
// @author       CodFrm
// @match        *://study.zhihuishu.com/learning/videoList*
// @grant        none
// @license      MIT
// ==/UserScript==

let config = {
    answer_ignore: false,     //忽略题目,勾选此处将不会答题
    auto: true,              //全自动挂机,无需手动操作,即可自动观看视频等
    interval: "5",           //时间间隔,当任务点完成后,会等待5分钟然后跳转到下一个任务点
    rand_answer: false,      //随机答案,没有答案的题目将自动的生成一个答案
    video_multiple: "1",     //视频播放倍速,视频播放的倍数,建议不要改动,为1即可,这是危险的功能
    video_mute: true,        //视频静音,视频自动静音播放
    vtoken: "user",          //鉴权token
};

localStorage['config'] = JSON.stringify(config);
