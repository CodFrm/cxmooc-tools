const common = require("./webpack.config.js");

let ret = common;
ret.entry = {
    cxmooc: __dirname + '/src/tampermonkey/cxmooc-pack.ts',
    zhihuishu: __dirname + '/src/tampermonkey/zhihuishu-pack.ts',
};
ret.output = {
    path: __dirname + '/build',
    filename: 'tampermonkey-[name].js'
};
module.exports = ret;
