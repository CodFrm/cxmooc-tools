module.exports = {
    entry: {
        mooc: __dirname + '/src/cxmooc-tools/mooc.js',
        start: __dirname + '/src/cxmooc-tools/start.js',
        action: __dirname + '/src/cxmooc-tools/action.js',
        background: __dirname + '/src/cxmooc-tools/background.js',
    },
    output: {
        path: __dirname + '/build/cxmooc-tools/src',
        filename: '[name].js'
    }
}