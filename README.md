<div align="center">
<h1 align="center">
网课小工具
</h1>

![GitHub stars](https://img.shields.io/github/stars/codfrm/cxmooc-tools.svg)
[![Build Status](https://github.com/CodFrm/cxmooc-tools/workflows/build/badge.svg?branch=master)](https://github.com/CodFrm/cxmooc-tools)
![GitHub tag (latest SemVer)](https://img.shields.io/github/tag/codfrm/cxmooc-tools.svg?label=version)
[![Chrome](https://img.shields.io/badge/chrome-success-brightgreen)](https://chrome.google.com/webstore/detail/%E8%B6%85%E6%98%9F%E6%85%95%E8%AF%BE%E5%B0%8F%E5%B7%A5%E5%85%B7/kkicgcijebblepmephnfganiiochecfl?hl=zh-CN)
[![FireFox](https://img.shields.io/badge/firefox-success-brightgreen)](https://addons.mozilla.org/zh-CN/firefox/addon/%E8%B6%85%E6%98%9F%E6%85%95%E8%AF%BE%E5%B0%8F%E5%B7%A5%E5%85%B7/)
[![tampermonkey](https://img.shields.io/badge/tampermonkey-success-yellowgreen)](https://greasyfork.org/zh-CN/scripts/376190-%E8%B6%85%E6%98%9F%E6%85%95%E8%AF%BE%E5%B0%8F%E5%B7%A5%E5%85%B7)
![GitHub All Releases](https://img.shields.io/github/downloads/CodFrm/cxmooc-tools/total)

</div>

- [关于网课小工具](#关于网课小工具)
- [从应用商店下载](#从应用商店下载)
- [功能支持列表](#功能支持列表)
- [适配列表](#适配列表)
- [参与开发](#参与开发)
  - [环境](#环境)
  - [Build](#build)
  - [贡献流程](#贡献流程)
- [题库](#题库)
- [关于反馈](#关于反馈)
- [免责声明](#免责声明)
## 关于网课小工具

一个 超星(学习通)/智慧树(知到)/中国大学mooc 刷课工具,火狐,谷歌,油猴支持.全自动任务,视频倍速秒过,作业考试题库,验证码自动打码(੧ᐛ੭挂科模式,启动)
**如果觉得好用，顺手点个 Star 吧 ❤❤❤**

**仓库地址：[CodFrm/cxmooc-tools](https://github.com/CodFrm/cxmooc-tools)**

## 从应用商店下载
[Chrome商店](https://chrome.google.com/webstore/detail/%E8%B6%85%E6%98%9F%E6%85%95%E8%AF%BE%E5%B0%8F%E5%B7%A5%E5%85%B7/kkicgcijebblepmephnfganiiochecfl?hl=zh-CN)

[FireFox商店](https://addons.mozilla.org/zh-CN/firefox/addon/%E8%B6%85%E6%98%9F%E6%85%95%E8%AF%BE%E5%B0%8F%E5%B7%A5%E5%85%B7/)

[greasyfork](https://greasyfork.org/zh-CN/scripts/376190-%E8%B6%85%E6%98%9F%E6%85%95%E8%AF%BE%E5%B0%8F%E5%B7%A5%E5%85%B7)


## 功能支持列表
> 详情请看使用文档,不同平台所支持的功能不尽相同

* [x] 视频挂机
* [x] 视频秒过
* [x] 视频倍速
* [x] 静音播放
* [x] 任务答题
* [x] 自动阅读
* [x] 自动填写验证码
* [x] 考试答题
* [x] 作业答题
  
## 适配列表
 * [x] Chrome for PC
 * [x] Firefox for PC
 * [x] Firefox for Mobile
 * [x] QQ 浏览器 for PC
 * [x] Tampermonkey


## 参与开发
> 如果你想参与开发,请阅读下面内容,如果只是使用本扩展,请移步 **[使用文档](https://cx.icodef.com/)**

### 环境:
* Node.js
* webpack

### Build
```bash
git clone https://github.com/CodFrm/cxmooc-tools.git
cd cxmooc-tools
npm install
npm run build
# 开发模式请使用
npm run dev
# 打包生成crx和油猴脚本
npm run tampermonkey
npm run pack
```

### 贡献流程
1. `Fork Repo`
2. 发起`Pull Request`，并简要描述更改内容。
3. `CI 检查通过`
4. `CodeReview`
5. 合并到项目仓库

## 题库
1. 题库大部分答案来源于用户答题后的页面采集,**所以需要有人第一次做过**,后来的人才能搜索到题目。
2. 可以配置随机题目,当题库中没有的题目则会自动随机选择一个选项
3. 考试题库收集,需要考试完毕后,进入考试答案页面,扩展会自动收集.

题库记录提示:

![](/dist/images/3.webp)

## 关于反馈
您可以通过Issues反馈，反馈时请尽量提供足够明确的信息。

## 免责声明
本项目完全开源，免费，仅供技术学习和交流，**开发者团队并未授权任何组织、机构以及个人将其用于商业或者盈利性质的活动。也从未使用本项目进行任何盈利性活动。未来也不会将其用于开展营利性业务。个人或者组织，机构如果使用本项目产生的各类纠纷，法律问题，均由其本人承担。**

如果您开始使用本项目，即视为同意项目免责声明中的一切条款，条款更新不再另行通知。**开发者仅接受和捐赠者之间不构成购买或雇佣关系的捐赠或者赞赏。** 如果您选择捐赠此项目，我们会列出一份捐赠者名单（包含捐赠金额，日期），但不会公布您的捐赠账号。如果您选择捐赠，那么我将视之为您完全自愿的，没有任何雇佣，购买关系的捐赠。

The project is completely open source, free, and is for technical learning and communication only. **The developer team does not authorize any organization, organization, or individual to use it for commercial or profitable activities. Never use this project for any profitable activities. It will not be used for profit-making business in the future. Individuals or organizations and organizations that use the various disputes arising from the project and legal issues shall be borne by themselves.**

If you start using this project, you are deemed to agree to all the terms in the project disclaimer, and the terms are updated without further notice. **Developers only accept donations or appreciations that do not constitute a purchase or employment relationship with the donor.** If you choose to donate this item, we will list a list of donors (including donation amount, date), but will not announce your donation account. If you choose to donate, then I will treat you as completely voluntary, without any employment, donation of the relationship.