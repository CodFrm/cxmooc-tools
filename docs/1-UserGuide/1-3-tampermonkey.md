---
title: Tampermonkey 脚本
---

## 安装
Tampermonkey Violentmonkey暴力猴,以下都称为油猴

油猴脚本使用需要去安装另外一个名叫**`Tampermonkey`**的插件,然后在下面链接中的页面获取插件,可以按需选择.不过尽量不要与插件版本一同安装,可能会导致冲突.

- [超星慕课小工具](https://greasyfork.org/zh-CN/scripts/376190-%E8%B6%85%E6%98%9F%E6%85%95%E8%AF%BE%E5%B0%8F%E5%B7%A5%E5%85%B7)
- [智慧树小工具](https://greasyfork.org/zh-CN/scripts/382037-%E6%99%BA%E6%85%A7%E6%A0%91%E5%B0%8F%E5%B7%A5%E5%85%B7)
- [中国大学慕课小工具](https://greasyfork.org/zh-CN/scripts/398719-%E4%B8%AD%E5%9B%BD%E5%A4%A7%E5%AD%A6%E6%85%95%E8%AF%BE%E5%B0%8F%E5%B7%A5%E5%85%B7)

### 配置修改
在油猴的**管理面板**中,选择编辑,按照类似下方的选项根据后面的注释按需进行修改(一般不需要修改)

![](/img/5.webp)

```js
let config = {
    answer_ignore: false,    //忽略题目,勾选此处将不会答题
    auto: true,              //全自动挂机,无需手动操作,即可自动观看视频等
    interval: 5,             //时间间隔,当任务点完成后,会等待5分钟然后跳转到下一个任务点
    rand_answer: false,      //随机答案,没有答案的题目将自动的生成一个答案
    video_multiple: 1,       //视频播放倍速,视频播放的倍数,建议不要改动,为1即可,这是危险的功能
    video_mute: true,        //视频静音,视频自动静音播放
    vtoken: "user",          //鉴权token(进群私聊机器人发送token获取)
};
```
根据代码中的说明进行配置,之后点击左上角文件,进行保存,或者快捷键 Ctrl+S 也可以保存,刷新一次页面就成功生效了.

![](/img/6.webp)