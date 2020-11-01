import {Task, TaskType} from "@App/internal/app/task";
import {Application} from "@App/internal/application";
import {createBtn, protocolPrompt, randNumber, substrex, UntrustedClick} from "@App/internal/utils/utils";
import {CourseQueryAnswer, CourseTopic} from "@App/mooc/course163/question";
import {
    Answer,
    Option,
    PushAnswer, QuestionBankFacade,
    QuestionStatusString,
    ToolsQuestionBank,
    ToolsQuestionBankFacade
} from "@App/internal/app/question";
import {Topic} from "@App/internal/app/topic";

export class TaskFactory {
    public static CreateTask(url: string, resp: string): Task {
        if (resp.indexOf("paper:s") > 0) {
            CourseTopicTask.collegeAnswer(this.getvalue(resp, resp.match(/,paper:(.*?),/)[1]));
            return new CourseTopicTask();
        } else if (resp.indexOf("tname:\"") > 0) {
            if (resp.indexOf("answers:s") > 0) {
                CourseTopicTask.collegeAnswer(this.getvalue(resp, resp.match(/,objectiveQList:(.*?),/)[1]));
            }
            return new CourseTopicTask(resp);
        } else if (resp.indexOf("videoVo:s") > 0) {
            return new VideoTask();
        } else if (resp.indexOf("list:s") > 0 && url.indexOf("PostBean.getPaginationReplys") > 0) {
            return new DiscussTask(this.getvalue(resp, resp.match(/,list:(.*?),/)[1]));
        } else if (resp.indexOf(",post:s") > 0) {
            return null;
        }
        return new NoSupportTask();
    }

    protected static getvalue(str: string, ret?: string): any {
        try {
            ret = ret || "s0";
            let script = str.match(/^([\s\S]+?)dwr.engine._remoteHandleCallback/)[1];
            script = "function a(){" + script + ";return " + ret + ";}a();";
            return eval(script);
        } catch (e) {
            Application.App.log.Error("获取题目发生了一个错误", e);
        }
        return null;
    }

}

export class NoSupportTask extends Task {
    public Start(): Promise<any> {
        return new Promise<any>(resolve => {
            resolve();
            Application.App.log.Info("暂不支持的类型,跳过");
            this.callEvent("complete");
        });
    }

    public Done(): boolean {
        return true;
    }

    public Type(): TaskType {
        return "other";
    }

}

export class VideoTask extends Task {

    protected timer: NodeJS.Timer;
    protected video: HTMLVideoElement;

    public Init(): Promise<any> {
        return new Promise<any>(resolve => {
            this.timer = setInterval(() => {
                let video = <HTMLVideoElement>document.querySelector("video[id]");
                if (video) {
                    clearInterval(this.timer);
                    this.video = video;
                    this.video.addEventListener("loadstart", () => {
                        this.initVideo();
                    });
                    this.video.addEventListener("ended", () => {
                        this.callEvent("complete");
                    });
                    this.callEvent("load");
                    Application.App.log.Debug("视频加载完成");
                    resolve();
                }
            }, 500);
        });
    }

    public Done(): boolean {
        return false;
    }

    public Stop(): Promise<void> {
        return new Promise<any>(resolve => {
            clearInterval(this.timer);
            this.callEvent("stop");
            resolve();
        });
    }

    protected initVideo() {
        this.video.muted = Application.App.config.video_mute;
        if (Application.App.config.video_multiple > 1) {
            this.video.playbackRate = Application.App.config.video_multiple;
        }
    }

    public Start(): Promise<any> {
        return new Promise<any>(resolve => {
            this.initVideo();
            this.video.play();
            this.timer = setInterval(() => {
                Application.App.config.auto && this.video.paused && this.video.play();
            }, 5000);
            resolve();
        });
    }

    public Type(): TaskType {
        return "video";
    }

}

export class CourseTopicTask extends Task {
    protected topic: Topic;
    protected bank: QuestionBankFacade;

    public static getid() {
        let id = document.URL.match(/(\?id|cid)=(.*?)($|&)/);
        if (!id) {
            id = document.URL.match(/(&id)=(.*?)$/);
        }
        if (!id) {
            return "";
        }
        return id[2];
    }

    constructor(resp?: any) {
        super();
        let info = "";
        if (resp) {
            info = substrex(resp, ",{aid:", ",");
        }
        let prefix = "";
        if (document.URL.indexOf("cid") > 0) {
            prefix = "c-";
        }
        this.bank = new ToolsQuestionBankFacade("mooc163", {
            refer: document.URL,
            id: prefix + CourseTopicTask.getid(),
            info: info,
        });
        if (resp) {
            this.bank.CheckCourse();
        }
    }

    public static collegeAnswer(resp: any) {
        let id = this.getid();
        if (id == "") {
            return;
        }
        let prefix = "";
        if (document.URL.indexOf("cid") > 0) {
            prefix = "c-";
        }
        let bank = new ToolsQuestionBank("mooc163", {
            refer: document.URL,
            id: prefix + id,
        });
        let answer = new Array<Answer>();
        let options: Array<any>;
        options = resp.objectiveQList;
        if (options == undefined) {
            options = resp;
        }
        if (options == undefined) {
            return
        }
        //TODO:优化,太难看了
        for (let i = 0; i < options.length; i++) {
            let topic = options[i];
            if (topic.type != 1 && topic.type != 2) {
                if (topic.type == 3) {
                    let tmpAnswer = new PushAnswer();
                    tmpAnswer.topic = topic.title;
                    tmpAnswer.type = 4;
                    tmpAnswer.correct = new Array<Option>();
                    if (!topic.stdAnswer) {
                        continue;
                    }
                    tmpAnswer.correct.push({
                        option: "一", content: topic.stdAnswer,
                    });
                    answer.push(tmpAnswer);
                } else if (topic.type == 4) {
                    let tmpAnswer = new PushAnswer();
                    tmpAnswer.topic = topic.title;
                    tmpAnswer.type = 3;
                    tmpAnswer.correct = new Array<Option>();
                    if (!topic.optionDtos) {
                        continue;
                    }
                    for (let n = 0; n < topic.optionDtos.length; n++) {
                        if (topic.optionDtos[n].answer) {
                            tmpAnswer.correct.push({
                                option: "正确" == topic.optionDtos[n].content,
                                content: "正确" == topic.optionDtos[n].content,
                            });
                            break;
                        }
                    }
                    answer.push(tmpAnswer);
                }
                continue;
            }
            if (!topic.optionDtos) {
                continue;
            }
            let option = new Array<Option>();
            let correct = new Array<Option>();
            let tmpAnswer = new PushAnswer();
            tmpAnswer.topic = topic.title;
            tmpAnswer.type = topic.type;
            for (let i = 0; i < topic.optionDtos.length; i++) {
                let opt = {content: topic.optionDtos[i].content, option: String.fromCharCode(65 + i)};
                if (topic.optionDtos[i].answer) {
                    correct.push(opt);
                }
                option.push(opt);
            }
            if (correct.length <= 0) {
                return;
            }
            tmpAnswer.correct = correct;
            tmpAnswer.answers = option;
            answer.push(tmpAnswer);
        }
        bank.Push(answer);
    }

    public Init(): Promise<any> {
        return new Promise<any>(resolve => {
            setTimeout(() => {
                if (document.querySelector("#tools-search")) {
                    document.querySelector("#tools-search").remove();
                }
                let search = createBtn("搜索答案", "点击搜索答案", "cx-btn mooc163-search", "tools-search");
                let divel = document.querySelector(".j-unitct .m-learnunitUI");
                if (!divel) {
                    divel = document.querySelector(".u-learn-moduletitle");
                }
                this.topic = new CourseTopic(document, this.bank);
                this.topic.SetQueryQuestions(new CourseQueryAnswer());
                search.onclick = async () => {
                    search.innerText = "搜索中...";
                    let ret = await this.Start();
                    search.innerText = QuestionStatusString(ret);
                };
                divel.insertBefore(search, divel.firstChild);
                resolve();
            }, 1000);
        });
    }

    public Done(): boolean {
        return false;
    }

    public Type(): TaskType {
        return "topic";
    }

    public Start(): Promise<any> {
        return new Promise<any>(async resolve => {
            protocolPrompt("你正准备使用中国慕课的答题功能,相应的我们需要你的正确答案,同意之后扩展将自动检索你的所有答案\n* 本项选择不会影响你的正常使用(协议当前版本有效)\n* 手动点击答题结果页面自动采集页面答案\n", "course_answer_collect_v2", "我同意");
            let ret = await this.topic.QueryAnswer();
            this.callEvent("complete");
            resolve(ret);
        });
    }

    public Submit(): Promise<void> {
        return new Promise<any>(resolve => {
            let el = <HTMLLinkElement>document.querySelector(".submit.j-submit");
            if (el.style.display == "none") {
                resolve();
            }
            UntrustedClick(el);
            let t = setInterval(() => {
                let el = <HTMLLinkElement>document.querySelector(".submit.j-replay");
                if (el && el.style.display != "none") {
                    clearInterval(t);
                    resolve();
                }
            }, 1000);
        });
    }

}

export class DiscussTask extends Task {

    protected list: any;

    constructor(resp: any) {
        super();
        this.list = resp;
    }

    protected isRepeat(): boolean {
        return document.querySelector("a.unfollowed") == undefined;
    }

    public Start(): Promise<any> {
        if (!this.list && this.list.lenght <= 0) {
            Application.App.log.Info("没有查询到记录,跳过");
            this.callEvent("complete");
            return;
        }
        if (this.isRepeat()) {
            Application.App.log.Info("已经关注,跳过");
            this.callEvent("complete");
            return;
        }
        Application.App.log.Info("复读机开启,准备复读(回复当前本讨论)");
        return new Promise<any>(resolve => {
            let num = 0;
            let timer = setInterval(() => {
                try {
                    let rand = this.list[randNumber(0, this.list.length - 1)];
                    let el = document.querySelector("iframe[id*=ueditor_]");
                    (<any>Application.GlobalContext).UE.instants["ueditorInstant" + el.id.substr(el.id.indexOf("_") + 1)].setContent(rand.content);
                } catch (e) {
                    if (num < 5) {
                        return;
                    }
                    Application.App.log.Error("发生了错误,准备跳过", e);
                }
                clearInterval(timer);
                this.callEvent("complete");
                resolve();
            }, 1000);
        });
    }

    public Done(): boolean {
        return false;
    }

    public Type(): TaskType {
        return "other";
    }

    public Submit(): Promise<void> {
        if (this.isRepeat()) {
            return;
        }
        return new Promise<any>(resolve => {
            Application.App.log.Info("准备提交");
            let el = <HTMLButtonElement>document.querySelector(".u-btn-sm.u-btn-primary");
            if (!el) {
                return resolve();
            }
            UntrustedClick(el);
            setTimeout(() => {
                resolve();
            }, 2000);
        });
    }

}