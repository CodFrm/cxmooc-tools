---
title: 开发者
---

## 准备工作

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

### Server
> 搭建了一个服务器程序用于完善题库。接口没有任何权限，只会记录正确答题答案,并不会记录其他信息。
> 以上过程全由插件自动提交,还请大家不要故意上传错误的答案哦 (๑• . •๑)
> 因为超星慕课全站启用了`https`,所以服务器配置需要`https`。

```bash
npm install
npm run server
```
### 构建之后
> 能够体验到最新的功能,需要按照[准备工作](#准备工作)的方法步骤配置本地环境,可能会存在一些BUG。

1. 执行`npm run build`,此时会在`build/cxmooc-tools`目录下生成插件文件。
2. 打开Chrome浏览器的更多工具选项，打开扩展程序页面并启用开发者模式。
3. 加载已解压的扩展程序，路径选择`build/cxmooc-tools`

