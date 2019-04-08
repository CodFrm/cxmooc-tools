---
title: 浏览器插件
---
# 插件使用与配置

### 开发者模式:
> 能够体验到最新的功能,需要按照[准备工作](#准备工作)的方法步骤配置本地环境,可能会存在一些BUG。

1. 执行`npm run build`,此时会在`build/cxmooc-tools`目录下生成插件文件。
2. 打开Chrome浏览器的更多工具选项，打开扩展程序页面并启用开发者模式。
3. 加载已解压的扩展程序，路径选择`build/cxmooc-tools`

### [推荐]火狐浏览器扩展（已发布至扩展市场，可直接点击安装）

如果你是火狐浏览器用户，请直接前往
[应用市场](https://addons.mozilla.org/zh-CN/firefox/addon/%E8%B6%85%E6%98%9F%E6%85%95%E8%AF%BE%E5%B0%8F%E5%B7%A5%E5%85%B7/)
下载安装插件。

*注意，本插件支持Firefox for Mobile*

为了方便安装,我们还提供了一个浏览器打包的版本,请在[release页面](https://github.com/CodFrm/cxmooc-tools/release)查看详情

![](/img/4.webp)

### 浏览器扩展模式(以Chrome浏览器为例):

下载发布的版本[cxmooc-tools.crx](https://github.com/CodFrm/cxmooc-tools/releases)无需安装环境,下载即可使用。

1. 下载发布的版本cxmooc-tools.crx文件，修改后缀为.zip，并将其解压到目录`cxmooc-tools`
2. 打开Chrome浏览器的更多工具选项，打开扩展程序页面并启用开发者模式。
3. 加载已解压的扩展程序，路径选择你解压的路径`cxmooc-tools/`

解压后`cxmooc-tools`目录应包含以下文件
```
.
├── img
|    └── some files
├── src
|    └── some files
└── manifest.json
```
**图文步骤**

![](/img/1.webp)
![](/img/2.webp)

加载完成后，打开超星慕课的课程或者题目页面之后就可以正常使用了。

### 拖拽安装CRX模式:

下载[发布版本](https://github.com/CodFrm/cxmooc-tools/releases)cxmooc-tools.crx文件,直接拖入浏览器安装
某些浏览器允许直接拖入扩展进行安装。(内核为Chromium,如果不行,请按照方法2来)

- 支持列表

* [x] 360极速浏览器
* [x] QQ浏览器