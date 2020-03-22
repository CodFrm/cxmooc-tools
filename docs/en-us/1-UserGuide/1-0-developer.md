---
title: 开发者模式
---

## 开发者模式:

### 准备工作
> 如果你想参与开发,请阅读下面内容,如果只是使用本插件,请移步 **[使用文档](https://cx-doc.xloli.top/)**

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
npm run pack
```

### 构建之后
> 能够体验到最新的功能,需要按照[准备工作](#准备工作)的方法步骤配置本地环境,可能会存在一些BUG。

1. 执行`npm run build`,此时会在`build/cxmooc-tools`目录下生成插件文件。
2. 打开Chrome浏览器的更多工具选项，打开扩展程序页面并启用开发者模式。
3. 加载已解压的扩展程序，路径选择`build/cxmooc-tools`



