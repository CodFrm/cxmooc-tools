---
title: 系统组件
---

> 为了方便开发,提供了很多内置组件来进行调用,每一个组件都提供了接口可以定制化
>
> 存放文件夹为`internal/utils`

在应用启动(mooc.ts)周期注入组件实例
```ts
let component = new Map<string, any>()
    .set("config", new ChromeConfigItems(NewFrontendGetConfig()))
    .set("logger", logger);
```

## 日志组件
方便采集日志,未来可以对一些严重的日志进行采集,分析bug出现情况

#### 接口
```ts
export interface Logger {
    Debug(...args: any[]): Logger;

    Info(...args: any[]): Logger;

    Warn(...args: any[]): Logger;

    Error(...args: any[]): Logger;

    Fatal(...args: any[]): Logger;
}
```
#### 实现
ConsoleLog console处打印日志内容

PageLog 会在窗口显示日志内容,并且根据等级不同会进行消息通知

#### 使用
```ts
Application.App.log.Error("获取题目发生了一个错误", e);
```

## 配置组件
应用配置,可以根据配置调整运行状态,也可作为一个存储组件使用,不过请勿存储较长内容

Config为配置基础接口,主要存储和监听配置kv

ConfigItems具体配置项
#### 接口
```ts
export interface Config {
    GetConfig(key: string, defaultVal?: string): string

    SetConfig(key: string, val: string): Promise<any>

    ConfigList(): any

    Watch(key: Array<string> | string, callback: ConfigWatchCallback): void
}

export interface ConfigItems extends Config {
    SetNamespace(namespace: string): void

    SetNamespaceConfig(namespace: string, key: string, val: string): Promise<any>

    GetNamespaceConfig(namespace: string, key: string, defaultVal?: string): string

    vtoken: string
    rand_answer: boolean
    auto: boolean
    video_mute: boolean
    answer_ignore: boolean
    video_cdn: string
    video_multiple: number
    interval: number
    topic_interval: number
    super_mode: boolean
}
```
#### 实现
ChromeConfigItems 具体配置项类,需要注入具体Config实例实现存储功能

backendConfig 在扩展的后端环境使用

frontendGetConfig 在扩展的前端环境使用
#### 使用

```ts
new ChromeConfigItems(NewFrontendGetConfig())
// 对于配置类的可以直接定义新的配置项
Application.App.config.auto
Application.App.config.auto=false
// 更偏向于储存的可以直接使用自定义key,不过请注意,不要存储过长的内容
Application.App.config.GetConfig("notify_tools_x")
Application.App.config.SetConfig("notify_tools_x", this.div.style.left);
```

#### 增减配置
增减配置需要修改`SystemConfig:config`,`config.ts:ConfigItems`中的内容,会自动修改配置面板内容

如果发布油猴版本,请在对应的油猴版本中添加相应的配置


