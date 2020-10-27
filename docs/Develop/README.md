---
title: 开始
---

> 欢迎提交PR和基于本扩展进行二次开发

## 准备工作

### 环境:
* Node.js
* webpack
* Npm

推荐IDE为:WebStorm,如果经常进行本项目维护,可以帮你申请开源的License

小功能调整使用VSCode即可

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
# 请注意,打包crx需要拥有一个pem密钥
npm run pack
```

### 构建之后
> 能够体验到最新的功能,需要按照[准备工作](#准备工作)的方法步骤配置本地环境,可能会存在一些BUG。

1. 执行`npm run build`,此时会在`build/cxmooc-tools`目录下生成扩展文件。
2. 打开Chrome浏览器的更多工具选项，打开扩展程序页面并启用开发者模式。
3. 加载已解压的扩展程序，路径选择`build/cxmooc-tools`

## 项目结构
```
|cxmooc-tools
├─tests               # 单元测试
├─build               # 构建之后的文件,需要在此目录放`cxmooc-tools.pem`文件
|  ├─cxmooc-tools     # 扩展文件夹
├─docs                # vuepress 文档
├─src                 # 扩展源码
|  ├─views            # 视图文件
|  ├─tampermonkey     # 油猴打包文件
|  ├─mooc             # 平台源码
|  ├─internal         # 内部软件包
|  ├─background.ts    # 扩展后端
|  ├─config.ts        # 扩展系统配置
|  ├─mooc.ts          # 扩展入口文件
|  ├─start.ts         # 扩展中间层

```

## 扩展架构图
![](/img/扩展架构图.png)

## 生命周期/流转图
![](/img/生命周期.png)

