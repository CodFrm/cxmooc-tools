---
title: 题库和答题功能
---

> 扩展抽象了题库,方便切换或者增加题库使用,题库后端和数据请自行整理
>
> 源码请看`internal/app/question.ts`和`internal/app/topic.ts`

> ps:这个模块其实挺乱的...想优化
## 题库接口
题库的接口
```ts
// 题库操作实现
export interface QuestionBankFacade {
    ClearQuestion(): void

    AddQuestion(q: Question): void

    Answer(callback: (status: QuestionStatus) => void): void

    Push(callback: (status: QuestionStatus) => void): void

    CheckCourse(): Promise<number>
}
// 题库存储实现
export interface QuestionBank {
    Answer(topic: Topic[], resolve: QuestionBankCallback): void;

    Push(answer: Answer[]): Promise<QuestionStatus>;

    SetInfo(info: QuestionInfo): void;

    CheckCourse?(info?: QuestionInfo[]): Promise<number>;
}
```
#### 实现
ToolsQuestionBankFacade 扩展自带题库

#### 使用
```ts
let topic = new ExamTopic(context, new ToolsQuestionBankFacade("cx", taskinfo));
```

## 答题接口
如果是利用现在的题库,开发者只需要专注实现下列接口,具体可参考现有平台
```ts
// 选项
export interface Options {
    Random(): TopicStatus;
    Fill(s: Answer): Promise<TopicStatus>;
    Correct(): Answer
}
// 题目,继承了选项接口
export interface Question extends Options {
    GetType(): TopicType;
    GetTopic(): string;
    SetStatus(status: TopicStatus): void;
}
// 查询任务中的题目,返回Question数组
export interface QueryQuestions {
    QueryQuestions(): Question[];
}
// 题目任务点
export abstract class Topic {
    public abstract Init(): Promise<any>;
    public abstract Submit(): Promise<any>;
}
```
#### 使用 
```ts
let topic = new ExamTopic(context, new ToolsQuestionBankFacade("cx", taskinfo));

```
