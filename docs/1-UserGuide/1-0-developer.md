---
title: 开发者
---

## 准备工作

### 环境:
* Node.js
* webpack
* Npm

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

1. 执行`npm run build`,此时会在`build/cxmooc-tools`目录下生成插件文件。
2. 打开Chrome浏览器的更多工具选项，打开扩展程序页面并启用开发者模式。
3. 加载已解压的扩展程序，路径选择`build/cxmooc-tools`

### 项目结构
```
|cxmooc-tools
├─tests               # 单元测试
|   ├─hook.test.ts
|   ├─utils.test.ts
|   ├─extension
├─src                 # 插件源码
|  ├─background.ts
|  ├─config.ts
|  ├─mooc.ts
|  ├─popup.ts
|  ├─start.ts
|  ├─views            # 视图文件
|  ├─tampermonkey     # 油猴打包文件
|  ├─mooc             # 平台源码
|  ├─internal         # 内部软件包
```
