
module.exports = {
    mode: 'development',
    entry: {
        cxmooc: __dirname + '/src/tampermonkey/cxmooc-pack.js',
        zhihuishu: __dirname + '/src/tampermonkey/zhihuishu-pack.js',
    },
    output: {
        path: __dirname + '/build',
        filename: 'tampermonkey-[name].js'
    }
}