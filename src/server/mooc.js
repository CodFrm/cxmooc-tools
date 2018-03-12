/**
 * 慕课数据库模型
 */

var mongodb = require('mongodb');
module.exports = function () {
    var url = "mongodb://localhost:27017/cxmooc";
    var db;
    var dbase;
    mongodb.connect(url, (err, _db) => {
        if (err) throw err;
        db = _db;
        dbase = db.db("cxmooc");
        dbase.createCollection('answer', function (err, res) {
            if (err) throw err;
        });
    });
    this.insert = function (set, row) {
        return dbase.collection(set).insertOne(row);
    }

    this.find = function (set, cond) {
        return dbase.collection(set).find(cond);
    }
    this.findOne = function (set, cond, callback) {
        return dbase.collection(set).findOne(cond, null, callback);
    }

    this.count = function (set, cond, callback) {
        return dbase.collection(set).count(cond, null, callback);
    }
    return this;

}