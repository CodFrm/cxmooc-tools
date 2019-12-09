const moocModel = require('./mooc');
// mongodb迁移至mysql
var http = require('http');
var url = require('url');
var util = require('util');

var mooc = new moocModel();

setTimeout(function () {
    const waitFor = (ms) => new Promise(r => setTimeout(r, ms));
    let i = mooc.traversal("answer")
    let next = function (err, doc) {
        let req = http.request({
            host: "127.0.0.1",
            port: "8080",
            path: "/answer?platform=" + (doc.platform || 'cx'),
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': doc.token || '',
            },
        })
        req.write(JSON.stringify([{
            answers: doc.answers,
            correct: doc.correct,
            topic: doc.topic,
            type: doc.type,
        }]))
        req.end()
        req.on("finish", () => {
            i.next(next)
        })
    }
    i.next(next)
}, 1000)

