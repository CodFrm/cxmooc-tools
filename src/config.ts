interface PlatformConfigItem {
    title: string
    description: string
    type: string
    key: string
    prompt?: string
    unit?: string
    value: string | boolean
}

interface PlatformConfig {
    name: string
    items: Array<PlatformConfigItem>
}

export class SystemConfig {
    public static version = 2.5;
    public static url = "https://cx.icodef.com/";
    public static hotVersion = "2.5.2";
    //TODO:优化规则,可以通过ci自动生成匹配规则到tampermonkey和manifest文件中
    public static match: { [key: string]: Array<string> } = {
        "cx": [
            "*://*/mycourse/studentstudy?*",
            "*://*/work/doHomeWorkNew?*",
            "*://*/work/selectWorkQuestionYiPiYue?*",
            "*://*/exam/test/reVersionTestStartNew?*",
            "*://*/ztnodedetailcontroller/visitnodedetail?*",
            "*://*/antispiderShowVerify.ac*",
            "*://*/html/processVerify.ac?*",
            "*://*/exam/test/reVersionPaperMarkContentNew?*",
            "*://*/ananas/modules/*/index.html?*",
            "*://*/exam/test?*",
            "*://*/course/*.html?*"
        ], "zhs": [
            "*://examh5.zhihuishu.com/stuExamWeb.html*",
            "*://onlineexamh5new.zhihuishu.com/stuExamWeb.html*",
            "*://studyh5.zhihuishu.com/videoStudy.html*",
        ], "mooc163": [
            "*://www.icourse163.org/learn/*",
            "*://www.icourse163.org/spoc/learn/*"
        ]
    }
    public static config: { [key: string]: PlatformConfig } = {
        cx: {
            name: "超星",
            items: [{
                title: "随机答案",
                description: "如果题库没有正确的答案会随机选择",
                type: "checkbox",
                key: "rand_answer",
                value: false,
            }, {
                title: "自动挂机",
                description: "进入一个页面就会自动开始挂机,完成一个任务之后会自动进行下一个",
                type: "checkbox",
                key: "auto",
                value: true,
            }, {
                title: "视频静音",
                description: "播放视频时,自动开启静音",
                type: "checkbox",
                key: "video_mute",
                value: true,
            }, {
                title: "忽略题目",
                description: "自动挂机时,忽略掉题目不做,直接跳过",
                type: "checkbox",
                key: "answer_ignore",
                value: false,
            }, {
                title: "超级模式",
                description: "超星平台下,超级模式会自动将flash播放器换成h5播放器",
                type: "checkbox",
                key: "super_mode",
                value: true,
            }, {
                title: "播放源",
                description: "锁定视频播放源,为空为记录最后一次选中的源(公网1,公网2等)",
                type: "text",
                key: "video_cdn",
                value: "默认"
            }, {
                title: "播放倍速",
                description: "视频播放的倍数,1为正常速度(最高16倍,该功能有一定危险)",
                type: "text",
                key: "video_multiple",
                prompt: "这是一个很危险的功能,建议不要进行调整,如果你想调整播放速度请在下方填写yes(智慧树平台播放速度和视频进度无关,最高只能1.5倍速)",
                unit: "倍",
                value: "1",
            }, {
                title: "跳转间隔",
                description: "视频(题目,任务点)完成后n分钟再继续下一个任务,可以有小数点,例如:0.5=30秒",
                type: "text",
                key: "interval",
                unit: "分",
                value: "1",
            }, {
                title: "做题间隔",
                description: "每一道题之间填写答案的时间间隔",
                type: "text",
                key: "topic_interval",
                unit: "秒",
                value: "5",
            }],
        }, zhs: {
            name: "智慧树",
            items: [{
                title: "随机答案",
                description: "如果题库没有正确的答案会随机选择",
                type: "checkbox",
                key: "rand_answer",
                value: false,
            }, {
                title: "自动挂机",
                description: "进入一个页面就会自动开始挂机,完成一个任务之后会自动进行下一个",
                type: "checkbox",
                key: "auto",
                value: true,
            }, {
                title: "视频静音",
                description: "播放视频时,自动开启静音",
                type: "checkbox",
                key: "video_mute",
                value: true,
            }, {
                title: "超级模式",
                description: "智慧树平台下,超级模式会让任务完成的倍速成真",
                type: "checkbox",
                key: "super_mode",
                value: true,
            }, {
                title: "播放倍速",
                description: "视频播放的倍数,1为正常速度(最高16倍,该功能有一定危险)",
                type: "text",
                key: "video_multiple",
                prompt: "这是一个很危险的功能,建议不要进行调整,如果你想调整播放速度请在下方填写yes(智慧树平台播放速度和视频进度无关,最高只能1.5倍速)",
                unit: "倍",
                value: "1",
            }, {
                title: "跳转间隔",
                description: "视频完成后n分钟再继续播放下一个,可以有小数点,例如:0.5=30秒",
                type: "text",
                key: "interval",
                unit: "分",
                value: "1",
            }, {
                title: "做题间隔",
                description: "每一道题之间填写答案的时间间隔",
                type: "text",
                key: "topic_interval",
                unit: "秒",
                value: "5",
            }],
        }, mooc163: {
            name: "中国大学MOOC",
            items: [{
                title: "随机答案",
                description: "如果题库没有正确的答案会随机选择",
                type: "checkbox",
                key: "rand_answer",
                value: false,
            }, {
                title: "自动挂机",
                description: "进入一个页面就会自动开始挂机,完成一个任务之后会自动进行下一个",
                type: "checkbox",
                key: "auto",
                value: true,
            }, {
                title: "视频静音",
                description: "播放视频时,自动开启静音",
                type: "checkbox",
                key: "video_mute",
                value: true,
            }, {
                title: "忽略题目",
                description: "自动挂机时,忽略掉题目不做,直接跳过",
                type: "checkbox",
                key: "answer_ignore",
                value: false,
            }, {
                title: "播放倍速",
                description: "视频播放的倍数,1为正常速度(最高16倍,该功能有一定危险)",
                type: "text",
                key: "video_multiple",
                prompt: "这是一个很危险的功能,建议不要进行调整,如果你想调整播放速度请在下方填写yes(智慧树平台播放速度和视频进度无关,最高只能1.5倍速)",
                unit: "倍",
                value: "1",
            }, {
                title: "跳转间隔",
                description: "视频完成后n分钟再继续播放下一个,可以有小数点,例如:0.5=30秒",
                type: "text",
                key: "interval",
                unit: "分",
                value: "1",
            }, {
                title: "做题间隔",
                description: "每一道题之间填写答案的时间间隔",
                type: "text",
                key: "topic_interval",
                unit: "秒",
                value: "5",
            }],
        },
    };
}
