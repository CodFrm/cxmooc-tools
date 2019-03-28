var redis = require('redis');

module.exports = function () {
    var client = redis.createClient({ "host": "127.0.0.1", "port": "6379" });
    client.on("error", function (err) {
        console.log("Redis error:" + err);
    });
    return client;
}