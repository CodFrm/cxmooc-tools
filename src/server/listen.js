var express = require('express');
var app = express();

app.get('/', function (req, res) {
    ret = '<h2>欢迎使用超星慕课刷课插件</h2><p>这个服务器将会记录你正确的答题答案,并不会记录你的任何账号信息</p>';
    ret += '<p>并且接口没有任何权限,全由插件提交上传,还请大家不要故意上传错误的答案 (๑• . •๑) </p><br/>';
    ret += '<a href="https://github.com/CodFrm/cxmooc-tools">插件地址</a>';
    res.send(ret);
})

var server = app.listen(8080, function () {

    var host = server.address().address
    var port = server.address().port

    console.log("Server started successfully\nHome URL:http://%s:%s", host, port)

})