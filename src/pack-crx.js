const fs = require('fs');
const ChromeExtension = require('crx');
const config = require('./config')

let version = dealVersion(config.version)
// build manifest
let manifest = fs.readFileSync('./build/cxmooc-tools/manifest.json');
manifest = manifest.toString().replace(/"version": "(.*?)"/, '"version": "' + version + '"');
fs.writeFileSync('./build/cxmooc-tools/manifest.json', manifest);
// build chrome
const crx = new ChromeExtension({
    privateKey: fs.readFileSync('./build/cxmooc-tools.pem')
});

crx.load(['./build/cxmooc-tools/manifest.json',
    './build/cxmooc-tools/img/navtu.webp',
    './build/cxmooc-tools/img/logo.png',
    './build/cxmooc-tools/src/*'
]).then(crx => crx.pack()).then(crxBuffer => {
    fs.writeFileSync('./build/cxmooc-tools.crx', crxBuffer);
}).catch(err => {
    console.error(err);
});

// build tampermonkey
let tampermonkey_cx = fs.readFileSync('./src/tampermonkey/cxmooc.js')
tampermonkey_cx = tampermonkey_cx.toString().replace(/@version\s+.*/, '@version ' + config.getHotVersion())
tampermonkey_cx += fs.readFileSync('./build/tampermonkey-mooc.js')
fs.writeFileSync('./build/cxmooc.js', tampermonkey_cx)

let tampermonkey_zhs = fs.readFileSync('./src/tampermonkey/zhihuishu.js')
tampermonkey_zhs = tampermonkey_zhs.toString().replace(/@version\s+.*/, '@version ' + config.getHotVersion())
tampermonkey_zhs += fs.readFileSync('./build/tampermonkey-zhihuishu.js')
fs.writeFileSync('./build/zhihuishu.js', tampermonkey_zhs)

function dealVersion(version) {
    let reg = /\d/g;
    let arr = '', ret = '';
    while (arr = reg.exec(version)) {
        ret += arr[0] + '.';
    }
    return ret.substr(0, ret.length - 1);
}