const htmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

var home = __dirname + '/src/cxmooc-tools';
module.exports = {
    entry: {
        mooc: home + '/mooc.js',
        start: home + '/start.js',
        background: home + '/background.js',
        popup: home + '/popup.js'
    },
    output: {
        path: __dirname + '/build/cxmooc-tools/src',
        filename: '[name].js'
    },
    plugins: [
        new htmlWebpackPlugin({
            filename: __dirname + '/build/cxmooc-tools/src/popup.html',
            template: home + '/html/popup.html',
            inject: 'head',
            title: '弹出页面',
            minify: {
                removeComments: true
            },
            chunks: ['popup']
        }), new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
            'window.jQuery': 'jquery'
        })
    ],
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            }, {
                test: /\.tsx$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            }
        ]
    },
    resolve: {
        extensions: ['.tsx', '.js']
    }
}