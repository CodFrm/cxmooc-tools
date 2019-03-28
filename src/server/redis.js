var redis = require('redis');

module.exports = function () {
    var client = redis.createClient(6379,"127.0.0.1");
    client.on("error", function (err) {
        console.log("Redis error:" + err);
    });
    this.onlineAdd = function (ip) {
        client.zadd("cxmooc:online", [Date.parse(new Date()), ip]);
    }
    this.onlineNum = function (call) {
        var time = Date.parse(new Date());
        client.zcount("cxmooc:online", [time - (5 * 60 * 1000), time], function (err, res) {
            call(err, res)
        });
    }
    return this
}