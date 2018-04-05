var htmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: {
        mooc: __dirname + '/src/cxmooc-tools/mooc.js',
        start: __dirname + '/src/cxmooc-tools/start.js',
        action: __dirname + '/src/cxmooc-tools/action.js',
        background: __dirname + '/src/cxmooc-tools/background.js',
        popup: __dirname + '/src/cxmooc-tools/popup.js'
    },
    output: {
        path: __dirname + '/build/cxmooc-tools/src',
        filename: '[name].js'
    },
    plugins: [
        new htmlWebpackPlugin({
            filename: __dirname + '/build/cxmooc-tools/src/popup.html',
            template: __dirname + '/src/cxmooc-tools/popup.html',
            inject: 'head',
            title: '弹出页面',
            minify: {
                removeComments: true
            },
            chunks: ['popup']
        })
    ]
}