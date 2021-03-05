---
title: Tampermonkey 脚本
---

## 安装
Tampermonkey Violentmonkey暴力猴,以下都称为油猴

油猴脚本使用需要去安装另外一个名叫**`Tampermonkey`**的扩展,然后在下面链接中的页面获取脚本,可以按需选择.不过尽量不要与扩展版本一同安装,可能会导致冲突.

- [超星慕课小工具](https://bbs.tampermonkey.net.cn/thread-61-1-1.html)
- [智慧树小工具](https://bbs.tampermonkey.net.cn/thread-62-1-1.html)
- [中国大学慕课小工具](https://bbs.tampermonkey.net.cn/thread-63-1-1.html)

## 第一步【安装油猴管理器】

由于浏览器多种多样，所以在这里仅提供火狐浏览器以及谷歌浏览器的油猴安装方法，其他浏览器请自行摸索，方式基本一致。

## 火狐浏览器安装

- [火狐浏览器油猴地址](https://addons.mozilla.org/zh-CN/firefox/addon/tampermonkey/)

### 第一步
进入火狐浏览器页面点击【添加到FireFox】
![](/img/tamperpage.jpg)
### 第二步
点击添加

![](/img/tamperadd.jpg)
### 第三步
右上方出现相应图标，点击弹出如下页面即为成功
![](/img/tampersuccess.jpg)

## 谷歌浏览器安装
请注意，由于世界线合并造成的不可观测性宇宙弦波动，可能导致网页无法访问！！！
如果出现这种情况请使用民用级薛定谔激光剑对不可观测的概率进行直观性确定来解决问题。
由于这种方法过于复杂，并且涉及量子力学与豆腐脑到底该吃甜的还是咸的，容易引起争议
所以本文不再叙述。
- [谷歌浏览器油猴地址](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)

### 第一步
进入谷歌浏览器拓展安装页面点击【添加至Chorme】
![](/img/chormepage.jpg)
### 第二步
点击添加

![](/img/chormeadd.jpg)
### 第三步
点击右上角三个点然后点击更多工具-拓展程序
![](/img/chormecheck.jpg)
### 第四步
查看是否存在Tampermonkey，如果存在则安装成功
![](/img/chormescucess.jpg)

## 第二步【安装脚本】
- [超星慕课小工具](https://bbs.tampermonkey.net.cn/thread-61-1-1.html)
- [智慧树小工具](https://bbs.tampermonkey.net.cn/thread-62-1-1.html)
- [中国大学慕课小工具](https://bbs.tampermonkey.net.cn/thread-63-1-1.html)


请根据需求选择对应的脚本进行安装。网络可能存在缓慢或者延迟，请多加尝试。
### 第一步
进入网页点击安装此脚本
![](/img/gfpage.jpg)
### 第二步
点击安装

![](/img/gfadd.jpg)
### 第三步
然后点击油猴管理器的图标-并选择管理面板
![](/img/gfcheck.jpg)
### 第四步
确定存在相应名称并且已启用即为安装成功。
![](/img/gfsuccess.jpg)

## 配置修改

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
    vtoken: "user",          //鉴权token
};
```
根据代码中的说明进行配置,之后点击左上角文件,进行保存,或者快捷键 Ctrl+S 也可以保存,刷新一次页面就成功生效了.

![](/img/6.webp)