const UglifyPlugin = require('uglifyjs-webpack-plugin')
module.exports = {
    entry: {
        mooc: __dirname + '/src/cxmooc-tools/mooc.js',
        background: __dirname + '/src/cxmooc-tools/background.js',
        start: __dirname + '/src/cxmooc-tools/start.js',
        action: __dirname + '/src/cxmooc-tools/action.js',
    },
    output: {
        path: __dirname + '/build/cxmooc-tools/src',
        filename: '[name].js'
    },
    plugins: [
        new UglifyPlugin()
    ]
}