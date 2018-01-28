const UglifyPlugin = require('uglifyjs-webpack-plugin')
module.exports = {
    entry: {
        mooc: __dirname + '/src/cxmooc-tools/mooc.js',
        md5: __dirname + '/src/cxmooc-tools/md5.js',
        background: __dirname + '/src/cxmooc-tools/background.js',
        start: __dirname + '/src/cxmooc-tools/start.js',
    },
    output: {
        path: __dirname + '/build/cxmooc-tools/src',
        filename: '[name].js'
    },
    plugins: [
        new UglifyPlugin()
    ]
}