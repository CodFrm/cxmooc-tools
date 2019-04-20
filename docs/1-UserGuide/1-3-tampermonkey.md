---
title: Tampermonkey 脚本
---

## 安装
Tampermonkey,以下都称为油猴

油猴脚本使用需要去安装另外一个**Tampermonkey**插件,然后在 **[Greasy Fork/376190-cxmooc-tools](https://greasyfork.org/zh-CN/scripts/376190-cxmooc-tools)** 页面获取本插件

- [智慧树小工具](https://greasyfork.org/zh-CN/scripts/382037-%E6%99%BA%E6%85%A7%E6%A0%91%E5%B0%8F%E5%B7%A5%E5%85%B7)

### 配置修改
在油猴的管理面板中,选择编辑

![](/img/5.webp)

```js
let config = {
    answer_ignore: true,    //忽略题目
    auto: true,              //全自动挂机
    interval: 5,           //时间间隔
    rand_answer: true,       //随机答案
    video_multiple: 1,     //视频播放倍速
    video_mute: true,        //视频静音
};
```
根据代码中的说明进行配置,之后点击左上角文件,进行保存,或者快捷键 Ctrl+S 也可以保存,刷新一次页面就成功生效了.

![](/img/6.webp)