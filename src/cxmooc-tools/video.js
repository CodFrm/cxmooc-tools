const common = require('./common');
const md5 = require("md5");
const createBtn = common.createBtn;
const get = common.get;

/**
 * 视频操作模块
 * @param {*} _this 
 * @param {*} elLogo 
 * @param {*} index 
 */
module.exports = function (_this, elLogo, index) {
    //获取要操作的对象和视频id
    var wid = _this.contentDocument.getElementsByTagName('iframe')[index].contentWindow;
    var doc = _this.contentDocument.getElementsByTagName('iframe')[index].contentDocument;
    var objId = _this.contentDocument.getElementsByTagName('iframe')[index].getAttribute('objectid');
    var iframe = _this.contentDocument.getElementsByTagName('iframe')[index];
    //视频的信息和题目
    var videoTopic = {};
    var videoInfo = {};
    //在框架内注入js
    common.injected(doc, 'action.js');
    //更换swf播放器
    var timer = setInterval(function () {
        var obj = doc.getElementsByTagName('object');
        if (obj.length > 0) {
            //开始重新加载
            clearInterval(timer);
            wid.removeOldPlayer(obj[0]);
        }
    }, 200);
    //创建各个按钮
    var hang_btn = createBtn('开始挂机');
    hang_btn.id = 'action-btn';
    hang_btn.value = index;
    hang_btn.title = "直接开始";
    elLogo.appendChild(hang_btn);
    hang_btn.onclick = function () {
        var config = JSON.parse(localStorage['config']);
        if (config['auto']) {
            //全自动挂机开始
            //判断完成的任务点
            var ans = _this.contentDocument.getElementsByClassName('ans-job-icon');
            if (ans[index].parentNode.className.indexOf('ans-job-finished') >= 0) {
                if (ans.length > index + 1) {
                    var nextAction = ans[index + 1].firstElementChild;
                    nextAction.click();
                } else {
                    common.switchTask();
                }
                return;
            }
            hang_btn.innerText = '挂机中...';
            var timer = setInterval(function () {
                if (wid.monitorPlay != undefined) {
                    clearInterval(timer);
                    wid.monitorPlay(function () {
                        //播放完成
                        console.log('over');
                        setTimeout(function () {
                            //判断有没有下一个,自动进行下一个任务
                            if (ans.length > index + 1) {
                                //点击
                                var nextAction = ans[index + 1].firstElementChild;
                                nextAction.click();
                            } else {
                                //已经是最后一个,切换任务
                                common.switchTask();
                            }
                        }, config['interval'] * 1000 * 60);
                    }, config);
                }
            }, 1000);

        } else {
            //TODO:wid.monitorPlay 重复多余的 以后可以去掉
            if (wid.monitorPlay != undefined) {
                wid.monitorPlay(undefined, config);
            } else {
                monitorPlay(undefined, config);
            }
        }
    }

    // var hang_mode_2 = createBtn('挂机模式2(bate)');
    // hang_mode_2.style.background = '#F57C00';
    // hang_mode_2.title = "还在测试中,不知道有什么样的风险,欢迎反馈,如果能成,将在全自动挂机迈出一大步^_^";
    // elLogo.appendChild(hang_mode_2);

    var boom = createBtn('秒过视频');
    boom.style.background = '#F57C00';
    boom.title = "秒过视频会被后台检测到";
    boom.value = index;
    elLogo.appendChild(boom);

    //获取参数
    var _index = 0;
    var mArg = _this.contentDocument.body.innerHTML;
    mArg = '{' + common.substrEx(mArg, 'mArg = {', ';');
    mArg = JSON.parse(mArg);
    for (let i = 0; i < mArg.attachments.length; i++) {
        if (mArg.attachments[i].objectId == objId) {
            _index = i;
            break;
        }
    }
    /**
     * 获取题目列表
     * @param {*} callback 
     */
    var getVideoTopic = function (callback) {
        if (videoTopic.length > 0) {
            callback(videoTopic);
            return;
        }
        // mArg.attachments[_index].mid = '13699717041081426508636528';
        get('/richvideo/initdatawithviewer?&start=undefined&mid=' +
            mArg.attachments[_index].mid).onreadystatechange = function () {
                if (this.readyState == 4) {
                    if (this.status == 200) {
                        var json = JSON.parse(this.responseText);
                        videoTopic = json;
                        callback(json);
                    }
                }
            }
    }
    /**
     * 获取视频信息
     * @param {*} callback 
     */
    var getVideoInfo = function (callback) {
        if (videoInfo.length > 0) {
            callback(videoInfo);
            return;
        }
        get('/ananas/status/' + mArg.attachments[_index].objectId +
            '?k=318&_dc=' + Date.parse(new Date())).onreadystatechange = function () {
                if (this.readyState == 4) {
                    if (this.status == 200) {
                        var json = JSON.parse(this.responseText);
                        videoInfo = json;
                        callback(json);
                    }
                }
            }
    }
    var createDiv = function (title) {
        var divEl = document.createElement('div');
        divEl.style.color = "#ff0101";
        divEl.style.textAlign = 'left';
        divEl.innerHTML = title;
        return divEl;
    }
    //获取正确答案
    var getTrueAnswer = function (list) {
        var right = '';
        for (let i = 0; i < list.length; i++) {
            if (list[i].isRight) {
                right += '<span style="margin-left:6px;">' + list[i].name + ":" + list[i].description + '</span>';
            }
        }
        if (right != '') {
            return right;
        }
        return '没有找到答案(没有,出bug了???)';
    }
    //展示题目答案
    getVideoTopic(function (data) {
        iframe.parentNode.appendChild(createDiv('本视频题目列表:'));
        for (let i = 0; i < data.length; i++) {
            var answer = getTrueAnswer(data[i].datas[0].options);
            var title = "题目" + (i + 1) + ":" + data[i].datas[0].description + "<br/>答案:   " + answer;
            var divEl = createDiv(title);
            iframe.parentNode.appendChild(divEl);
        }
    });

    var send_answer_pack = function (resourceid, answer, callback) {
        get('/richvideo/qv?resourceid=' + resourceid + "&answer='" + answer + "'").onreadystatechange = function () {
            if (this.readyState == 4) {
                if (this.status == 200) {
                    var json = JSON.parse(this.responseText);
                    if (callback != undefined) {
                        callback(json);
                    }
                }
            }
        }
    }

    /**
     * 挂机类
     */
    var hang = function (res) {
        var _instance = this;
        if (res.prompt != undefined) {
            _instance.prompt = res.prompt;
        }
        var timer = 0;
        var time = 0;
        this.start = function (start_time = 0) {
            start_time = parseInt(start_time == null ? 0 : start_time);
            var begin = false;
            timer = setInterval(function () {
                var tmpTime = (time + start_time);
                //判断题目,然后减个5-6秒
                for (let i = 0; i < videoTopic.length; i++) {
                    if (videoTopic[i].datas[0].startTime == (tmpTime) && videoTopic[i].datas[0].isAnswer == undefined) {
                        videoTopic[i].datas[0].isAnswer = true;
                        time -= (5 + Math.floor((Math.random() * 5) + 1));
                        //时间到了,回答题目
                        console.log('qqq');
                        var answer = getTrueAnswer(videoTopic[i].datas[0].options);
                        send_answer_pack(videoTopic[i].datas[0].resourceId, answer.name);
                    }
                }
                //判断开始和结束
                if (time <= 0 || (tmpTime) >= videoInfo.duration) {
                    if (time > 0 || !begin) {
                        begin = true;
                        getVideoInfo(function (info) {
                            console.log(tmpTime);
                            send_time_pack(tmpTime, function (ret) {
                                if (ret == true) {
                                    _instance.stop();
                                    if (_instance.prompt != undefined) {
                                        _instance.prompt(1);
                                    }
                                }
                            });
                        });
                        if ((tmpTime) >= videoInfo.duration) {
                            _instance.stop();
                            if (_instance.prompt != undefined) {
                                _instance.prompt(2);
                            }
                        }
                    }
                }
                console.log(time);
                time += 1;
            }, 1000);
        }

        this.stop = function () {
            clearTimeout(timer);
        }
        return this;
    };
    //挂机模式2按钮事件
    var instance_hang = new hang({
        prompt: function (code) {
            switch (code) {
                case 1:
                    alert('已经通过的视频');
                    break;
                case 2:
                    alert('视频挂机完成');
                    break;
                default:
                    alert('不明错误');
                    break
            }
        }
    });

    // hang_mode_2.onclick = function () {
    //     if (hang_mode_2.getAttribute('start') == 'true') {
    //         //开始则为暂停
    //         hang_mode_2.innerText = "挂机模式2(bate)";
    //         hang_mode_2.setAttribute('start', 'false');
    //         instance_hang.stop();
    //     } else {
    //         hang_mode_2.innerText = "停止挂机(bate)";
    //         hang_mode_2.setAttribute('start', 'true');
    //         instance_hang.start(hang_mode_2.getAttribute('time'));
    //     }
    //     console.log("这是一个在测试阶段的产物");
    // }

    /**
     * 发送一个时间包
     * @param {*} time 
     */
    var send_time_pack = function (playTime, callback) {
        getVideoInfo(function (json) {
            var enc = '[' + mArg.defaults.clazzId + '][' + mArg.defaults.userid + '][' +
                mArg.attachments[_index].property._jobid + '][' + mArg.attachments[_index].objectId + '][' +
                (playTime * 1000).toString() + '][d_yHJ!$pdA~5][' + (json.duration * 1000).toString() + '][0_' +
                json.duration + ']';
            enc = md5(enc);
            get('/multimedia/log/' + json.dtoken + '?clipTime=0_' + json.duration +
                '&otherInfo=' + mArg.attachments[_index].otherInfo +
                '&userid=' + mArg.defaults.userid + '&rt=0.9&jobid=' + mArg.attachments[_index].property._jobid +
                '&duration=' + json.duration + '&dtype=Video&objectId=' + mArg.attachments[_index].objectId +
                '&clazzId=' + mArg.defaults.clazzId +
                '&view=pc&playingTime=' + playTime + '&isdrag=4&enc=' + enc).onreadystatechange = function () {
                    if (this.readyState == 4) {
                        if (this.status == 200) {
                            let isPassed = JSON.parse(this.responseText);
                            callback(isPassed.isPassed);
                            return;
                        }
                    }
                }
        });
    }

    //秒过按钮事件
    boom.onclick = function () {
        if (localStorage['boom_no_prompt'] == undefined || localStorage['boom_no_prompt'] != 1) {
            var msg = prompt('秒过视频会产生不良记录,是否继续?如果以后不想再弹出本对话框请在下方填写yes')
            if (msg === null) return;
            if (msg === 'yes') localStorage['boom_no_prompt'] = 1;
        }
        getVideoInfo(function (json) {
            var playTime = parseInt(json.duration - Math.random(1, 2));
            send_time_pack(playTime, function (ret) {
                if (ret == true) {
                    alert('秒过成功,刷新后查看效果');
                } else {
                    alert('操作失败,错误');
                }
            });
        });
    }

    function monitorPlay(playOver, config) {
        var document = wid.document;
        function unshowOcclusion() {
            var playBtn = document.querySelector('.vjs-big-play-button');
            console.log(playBtn);
            if (playBtn != null) {
                playBtn.style.display = 'none';
            }
            var tmp = document.querySelector('.vjs-poster');
            if (tmp != null) {
                tmp.style.display = 'none';
            }
        }
        var timer = setInterval(function () {
            var player = document.querySelector('#video_html5_api');
            if (player == undefined || player == null) {
                return;
            }
            clearInterval(timer);
            /**
             * 对cdn进行处理
             */
            if (localStorage['cdn'] != undefined) {
                var url = player.src;
                url = url.substr(url.indexOf('/video/'));
                console.log(url);
                player.src = localStorage['cdn'] + url;
                console.log(player.src);
            }
            //判断是否播放，顺便让那个按钮和界面不可见
            unshowOcclusion();
            play();
            player.onpause = function () {
                console.log('pause');
                if (player.currentTime <= player.duration - 1) {
                    play();
                }
            }
            player.onloadstart = function () {
                var cdn = player.currentSrc;
                cdn = cdn.substr(0, cdn.indexOf('/video/', 10));
                localStorage['cdn'] = cdn;
                console.log('cdn change ' + cdn);
            }
            player.onended = function () {
                console.log('end');
                if (playOver != undefined) {
                    playOver();
                }
            }
            function play() {
                var time = setInterval(function () {
                    if (player.paused) {
                        player.play();
                        console.log(config);
                        player.muted = config.video_mute;
                        player.playbackRate = config.video_multiple;
                    } else {
                        clearInterval(time);
                    }
                }, 1000);
            }
        }, 200);
    }
}