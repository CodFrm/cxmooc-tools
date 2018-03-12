var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var moocModel = require('./mooc');
var mooc = new moocModel();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.get('/', function (req, res) {
    ret = '<h2>欢迎使用超星慕课刷课插件</h2><p>这个服务器将会记录你正确的答题答案,并不会记录你的任何账号信息</p>';
    ret += '<p>并且接口没有任何权限,全由插件提交上传,还请大家不要故意上传错误的答案 (๑• . •๑) </p><br/>';
    ret += '<a href="https://github.com/CodFrm/cxmooc-tools">插件地址</a>';
    res.send(ret);
})

app.post('/answer', function (req, res) {
    var ip = getClientIp(req);
    if (req.body.topic && req.body.type) {
        mooc.count('answer', {
            topic: req.body.topic,
            type: req.body.type
        }, function (err, result) {
            if (err) throw err;
            if (result >= 0 && result < 10) {
                var data = req.body;
                data.ip = ip;
                data.time = Date.parse(new Date());
                mooc.insert('answer', data);
            }
            res.send({
                code: 0,
                msg: 'success'
            });
        });
    } else {
        res.send({
            code: -1,
            msg: 'error'
        });
    }
})

function getClientIp(req) {
    return req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
}
app.get('/answer', function (req, res) {
    console.log(req.query);
    var topic = req.query.topic;
    var ret = [];
    for (let i = 0; i < topic.length; i++) {
        mooc.find('answer', {
            topic: topic[i],
            type: type[i]
        }).limit(10).toArray(function (err, result) {
            var pushData = {
                topic: topic[i],
            };
            if (result) {
                pushData.result = result;
            } else {
                pushData.result = null
            }
            ret.push(pushData);
        });
    }

})

var server = app.listen(8080, function () {
    var host = server.address().address
    var port = server.address().port
    console.log("Server started successfully\nHome URL:http://%s:%s", host, port)
})