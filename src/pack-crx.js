const fs = require('fs');
const ChromeExtension = require('crx');

const crx = new ChromeExtension({
    privateKey: fs.readFileSync('./build/cxmooc-tools.pem')
});

crx.load(['./build/cxmooc-tools/manifest.json',
    './build/cxmooc-tools/img/logo.png',
    './build/cxmooc-tools/src/*'
]).then(crx => crx.pack()).then(crxBuffer => {
    fs.writeFileSync('./build/cxmooc-tools.crx', crxBuffer);
}).catch(err => {
    console.error(err);
});
