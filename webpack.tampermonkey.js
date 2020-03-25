const common = require("./webpack.config.js");

let ret = common;
ret.mode = 'development';
ret.entry = {
    cxmooc: __dirname + '/src/tampermonkey/cxmooc-pack.ts',
    zhihuishu: __dirname + '/src/tampermonkey/zhihuishu-pack.ts',
    course163: __dirname + '/src/tampermonkey/course163-pack.ts',
};
ret.output = {
    path: __dirname + '/build',
    filename: 'tampermonkey-[name].js'
};
ret.plugins = [];
module.exports = ret;
