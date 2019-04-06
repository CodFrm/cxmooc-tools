const net = require('net');
const config = require('./config');
const HashMap = require('hashmap');
const MAX_CONNECT = 10;
module.exports = function () {
    //10连接池
    let client = new Array(MAX_CONNECT)
    let last = 0;
    let task = new HashMap();
    for (let i = 0; i < MAX_CONNECT; i++) {
        client[i] = net.Socket();
        function connect() {
            client[i].connect(config.vcodeport, config.vcodehost, function () {
                console.log('client connect success');
            });
        }
        connect();
        client[i].on('data', function (data) {
            //解包
            let pack = unpack(toArrayBuffer(data));
            let send = task.get(pack.tag);
            if (send != undefined && send.callback != undefined) {
                send.callback(pack);
            }
            task.delete(pack.tag);
        });
        client[i].on("end", function () {
            console.log("client disconnect,reconnect");
            connect();
        });
        client[i].on("error", function () {
            console.log("client error,reconnect");
            connect();
        });
        client[i].on("onclose", function () {
            console.log("client error,reconnect");
            connect();
        });
    }

    this.vcodesend = function (vcode, callback) {
        let tag = randomWord(false, 8);
        let send = {
            version: 'v001',
            tag: tag,
            data: vcode
        };
        client[getSendIndex()].write(pack(send));
        send.callback = callback;
        task.set(tag, send);
    }

    function getSendIndex() {
        last++;
        if (last >= MAX_CONNECT) {
            last = 0;
        }
        return last;
    }
    //定时删除超时任务
    setInterval(function () {
        let now = timestamp();
        task.forEach(function (v, k) {
            if (v.time + 15 < now) {
                if (v.callback != undefined) {
                    v.callback();
                }
                task.delete(k);
            }
        });
    }, 5000);
    return this;
}

// type Packgee struct {
// 	Conn    net.Conn
// 	Version [4]byte
// 	Len     int32
// 	Tag     [8]byte
// 	Time    int64
// 	Data    []byte
// }
function unpack(byte) {
    let dataview = new DataView(byte);
    let datalen = dataview.getInt32(4);
    let time = dataview.getBigInt64(16);
    return {
        version: String.fromCharCode.apply(null, new Uint8Array(byte.slice(0, 4))),
        len: datalen,
        tag: String.fromCharCode.apply(null, new Uint8Array(byte.slice(8, 16))),
        time: time,
        data: String.fromCharCode.apply(null, new Uint8Array(byte.slice(24))),
    }
}

function pack(struct) {
    struct.len = struct.data.length + 24;
    struct.time = timestamp();
    let ret = new ArrayBuffer(struct.len);
    let dataview = new DataView(ret);
    dataview.setUint8(0, struct.version.charCodeAt(0))
    dataview.setUint8(1, struct.version.charCodeAt(1))
    dataview.setUint8(2, struct.version.charCodeAt(2))
    dataview.setUint8(3, struct.version.charCodeAt(3))
    dataview.setInt32(4, struct.len)
    //tag
    for (let i = 0; i < 8; i++) {
        dataview.setUint8(8 + i, struct.tag.charCodeAt(i))
    }
    //time
    dataview.getBigInt64(16, struct.time)
    //data
    for (let i = 0; i < struct.len - 24; i++) {
        dataview.setUint8(24 + i, struct.data[i])
    }
    return toBuffer(ret);
}

function timestamp() {
    var tmp = Date.parse(new Date()).toString();
    tmp = tmp.substr(0, 10);
    return tmp;
}

/**
 * randomWord 产生任意长度随机字母数字组合
 * @param randomFlag 是否任意长度 min-任意长度最小位[固定位数] max-任意长度最大位
 * @param min
 * @param max
 * @returns {string}
 */
function randomWord(randomFlag, min, max) {
    var str = "",
        range = min,
        arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    // 随机产生
    if (randomFlag) {
        range = Math.round(Math.random() * (max - min)) + min;
    }
    for (var i = 0; i < range; i++) {
        pos = Math.round(Math.random() * (arr.length - 1));
        str += arr[pos];
    }
    return str;
}

function toBuffer(ab) {
    var buf = Buffer.alloc(ab.byteLength);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buf.length; ++i) {
        buf[i] = view[i];
    }
    return buf;
}

function toArrayBuffer(buf) {
    var ab = new ArrayBuffer(buf.length);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buf.length; ++i) {
        view[i] = buf[i];
    }
    return ab;
}