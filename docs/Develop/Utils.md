---
title: 通用工具
---

> 为了方便开发,封装了很多通用工具
>
> 更多详细内容可看`internal/utils/utils.ts`

## http请求
工具封装的http工具可用于跨域访问
```ts
HttpUtils.HttpPost(SystemConfig.url + "v2/check?platform=" + this.platform, "info=" + encodeURIComponent(JSON.stringify(info)), {
    headers: {
        "Authorization": Application.App.config.vtoken,
        "X-Version": SystemConfig.version.toString(),
    },
    success: () => {
        resolve(0);
    }, error: () => {
        resolve(-1);
    }
});
```

## 浏览器通知
浏览器弹窗通知
```ts
Noifications({
    title: "超星慕课小工具",
    text: text,
    timeout: 1000,
});
```

## 警告弹窗
适用于某些危险功能提示
```ts
if (!protocolPrompt("秒过视频会产生不良记录,是否继续?", "boom_no_prompt")) {
    return;
}
```

## 不可信点击
需要配合专用浏览器
```ts
UntrustedClick(ret);
```