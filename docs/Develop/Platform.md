---
title: 平台开发
---

> 为了方便开发,抽象了平台的流程,只需要专注于功能的实现

## 开始
创建新的平台应该遵循现有规则,在`mooc`文件夹下创建以平台为命名规则的文件夹

且有文件`mooc/[platform]/platform.ts`,实现`MoocFactory`接口的类,用于通过页面信息来创建对应的具体`Mooc`对象,如果不符合规则返回`null`,对应`构建实例(mooc/[platform]/platform.ts)`生命周期

需要在`/build/cxmooc-tools/manifest.json`文件和`/src/config.ts`中添加对应的URL规则

如果你需要开发油猴脚本,那么你需要在`/src/tampermonkey`目录中添加对应的油猴文件,且在`webpack.tampermonkey.js`和`internal/pack-crx.ts:43`中添加对应配置,具体请参考现有平台


## 实现Mooc接口
具体请看已有平台

#### 接口定义
```ts
// 事件
export type MoocEvent = "complete" | "reload" | "error" | "taskComplete";

// 单个Mooc任务,可能会被抛弃
export interface Mooc {
    Init(): any
}

// Mooc任务集,未来更倾向于使用此接口
export interface MoocTaskSet extends Mooc, IEventListener<MoocEvent> {
    // 初始化
    Init(): Promise<any>

    // 停止
    Stop(): Promise<any>

    // 返回下一个任务点
    Next(): Promise<Task>

    // 设置任务点位置
    SetTaskPointer(index: number): void;
}
```
