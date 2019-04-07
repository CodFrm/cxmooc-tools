const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const moocModel = require('./mooc');
const md5 = require("md5");
const config = require('../config');
const serverConfig = require('./config');
const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');
const redisCli = require('./redis');
const vcodePack = require('./vcode');

const PORT = 8080;
const SSLPORT = 8081;

var httpServer = http.createServer(app);
//创建http服务器  
httpServer.listen(PORT, function () {
    console.log('HTTP Server is running on: http://localhost:%s', PORT);
});

if (serverConfig.env == 'prod') {
    var privateKey = fs.readFileSync(path.join(__dirname, './certificate/private.key'), 'utf8');
    var certificate = fs.readFileSync(path.join(__dirname, './certificate/file.crt'), 'utf8');
    var credentials = {
        key: privateKey,
        cert: certificate
    };
    var httpsServer = https.createServer(credentials, app);
    //创建https服务器  
    httpsServer.listen(SSLPORT, function () {
        console.log('HTTPS Server is running on: https://localhost:%s', SSLPORT);
    });
}

var mooc = new moocModel();
var redis = new redisCli();
var vcode = new vcodePack();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(express.static(path.join(__dirname, 'static'), {
    maxage: '7d'
}));

app.get('/', function (req, res) {
    ret = '<h2>欢迎使用超星慕课刷课插件</h2><p>这个服务器将会记录你正确的答题答案,并不会记录你的任何账号信息</p>';
    ret += '<p>并且接口没有任何权限,全由插件提交上传,还请大家不要故意上传错误的答案 (๑• . •๑) </p><br/>';
    ret += '<a href="https://github.com/CodFrm/cxmooc-tools">插件地址</a>';
    res.send(ret);
})

//在线人数中间件+允许跨域
app.use(function (req, res, next) {
    var ip = getClientIp(req);
    redis.onlineAdd(ip);

    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    if (req.method == "OPTIONS") {
        res.send(200);
    } else {
        next();
    }
})

app.all('/player/*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    next();
});

app.post('/answer', function (req, res) {
    var ip = getClientIp(req);
    var ret = [];
    if (req.body.length <= 0) {
        res.send({
            code: 0,
            msg: 'success'
        });
        return;
    }
    for (let i in req.body) {
        let topic = req.body[i];
        if (topic.correct == undefined || topic.type == undefined || topic.topic == undefined) {
            continue;
        }
        let type = parseInt(topic.type);
        let hash = md5(topic.topic + type.toString());
        let cond = {
            hash: hash
        };
        mooc.findOne('answer', cond, function (err, result) {
            if (result == null) {
                //想了想,记录10次没有任何意义,反而给恶意提交的人机会
                let data = topic;
                data.hash = hash;
                cond.hash = data.hash;
                data.ip = ip;
                data.time = Date.parse(new Date());
                mooc.insert('answer', data);
            } else if (type == 4 && result.type == 4) {
                //填空题,答案合并
                try {
                    let correct = mergeAnswer(result.correct, topic.correct);
                    mooc.updateOne('answer', cond, {
                        $set: {
                            "correct": correct
                        }
                    });
                } catch (e) {
                    console.log("错误的数据结构");
                }
            }
            ret.push(cond);
            if (ret.length == req.body.length) {
                res.send({
                    code: 0,
                    msg: 'success',
                    result: ret
                });
            }
        });
    }
})

function mergeAnswer(source, answer) {
    //合并答案
    try {
        for (let i = 0; i < answer.length; i++) {
            let flag = true;
            for (let n = 0; n < source.length; n++) {
                if (source[n].option == answer[i].option) {
                    flag = false;
                    break;
                }
            }
            if (flag) {
                source.push(answer[i]);
            }
        }
    } catch (e) {
        return null;
    }
    return source;
}

app.get('/update', function (req, res) {
    redis.onlineNum(function (err, data) {
        res.send({
            version: config.version,
            url: config.update,
            enforce: config.enforce,
            injection: config.injection,
            onlinenum: data
        });
    });
})

function getClientIp(req) {
    return req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
}
app.post('/v2/answer', function (req, res) {
    var topic = req.body.topic || [];
    var type = req.body.type || [];
    selectAnswer(topic, res, function (i) {
        var where = {};
        topic[i] = dealSymbol(topic[i]);
        var topic_n = topic[i];
        // topic[i] = topic;
        if (type[i] != undefined) {
            where = { topic: { $regex: topic_n }, type: parseInt(type[i]) };
        } else {
            where = { topic: { $regex: topic_n } };
        }
        return where;
    });
});

function dealSymbol(topic) {
    topic = topic.replace(/[，,]/g, '[,，]');
    topic = topic.replace(/[(（]/g, '[(（]');
    topic = topic.replace(/[）)]/g, '[）)]');
    topic = topic.replace(/[？?]/g, '[？?]');
    topic = topic.replace(/[：:]/g, '[：:]');
    topic = topic.replace(/[“”"]/g, '[“”"]');
    return topic;
}

app.get('/answer', function (req, res) {
    var topic = req.query.topic || [];
    selectAnswer(topic, res, function (i) {
        return { topic: topic[i] };
    });
})

function selectAnswer(topic, res, where) {
    var ret = [];
    if (topic.length <= 0) {
        res.send({
            code: 0,
            msg: 'success'
        });
        return;
    }
    for (let i = 0; i < topic.length; i++) {
        mooc.find('answer', where(i), {
            fields: {
                _id: 0,
                topic: 1,
                type: 1,
                hash: 1,
                time: 1,
                correct: 1
            }
        }).limit(10).toArray(function (err, result) {
            var pushData = {
                topic: topic[i],
                index: i
            };
            if (result) {
                pushData.result = result;
            }
            ret.push(pushData);
            if (ret.length == topic.length) {
                res.send(ret);
            }
        });
    }
}

//api统计
app.use('/vcode', function (req, res, next) {
    var ip = getClientIp(req);
    redis.callStatis('vcode', req);
    //限制,ua 12,ip 100
    let ua = req.get('User-Agent');
    if (!ua) {
        return res.send({ code: -1, msg: 'ua null' });
    }
    redis.apiLimit('vcode', ua, 12, ip, function (uanum, ipnum) {
        if (uanum > 12 || ipnum > 100) {
            res.send({ code: -2, msg: '超出限制' });
        } else {
            next();
        }
    });
});

app.post('/vcode', function (req, res) {
    if (req.body.img.length <= 0) {
        return res.send({ code: -1, msg: 'img null' });
    }
    vcode.vcodesend(new Buffer(req.body.img, 'base64'), function (pack) {
        if (pack != undefined && pack.data != undefined && pack.data != '') {
            res.send({ code: 0, msg: pack.data });
        } else {
            res.send({ code: -1, msg: 'error' });
        }
    });
});