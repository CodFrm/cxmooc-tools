var redis = require('redis');

module.exports = function () {
    var client = redis.createClient(6379, "127.0.0.1");
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
    this.callStatis = function (api, param) {
        let date = new Date();
        client.hincrby("cxmooc:api-statis-" + api, (param ? param + '_' : '') + date.getFullYear() + '_' + (date.getMonth() + 1) + '_' + (date.getDate()), 1);
    }
    this.apiLimit = function (api, ua, max, ip, numCall) {
        let key = "cxmooc:" + api + "-limit-" + (new Date()).getDate();
        client.hincrby('u_i_' + key, ua + ip, 1, function (err1, num1) {
            if (num1 > max) {
                return numCall(num1, 0);
            }
            client.hincrby('i_' + key, ip, 1, function (err2, num2) {
                numCall(num1, num2);
            });
        });
    }
    this.vtoken = function (token, callback) {
        if(!token){
            return callback(0);
        }
        client.decr('cxmooc:vtoken:' + token, function (err, res) {
            callback(res);
        });
    }
    return this
}