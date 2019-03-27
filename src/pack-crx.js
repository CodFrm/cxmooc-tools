const fs = require('fs');
const ChromeExtension = require('crx');
const config = require('./config')
const { exec } = require('child_process');

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
exec('webpack --mode development --config webpack.config.js', function () {
    let tampermonkey = fs.readFileSync('tampermonkey.js')
    tampermonkey = tampermonkey.toString().replace(/@version\s+.*/, '@version ' + version)
    tampermonkey += fs.readFileSync('./build/cxmooc-tools/src/mooc.js')
    fs.writeFileSync('./build/tampermonkey.js', tampermonkey)
})

function dealVersion(version) {
    let reg = /\d/g;
    let arr = '', ret = '';
    while (arr = reg.exec(version)) {
        ret += arr[0] + '.';
    }
    return ret.substr(0, ret.length - 1);
}