module.exports = {
    url: "https://cx.icodef.com/",
    version: 2.12,
    update: 'https://github.com/CodFrm/cxmooc-tools/releases',
    enforce: false,
    cx: {
        player: 'https://cx.icodef.com/player/cxmooc-tools.swf',
        resplugin: 'https://cx.icodef.com/player/ResourcePlug.swf'
    },
    injection: '',
    hotversion: {
        v2_10: 2.106,
        v2_08: 2.083,
        v2_07: 2.071,
        v2_06: 2.06,
    },
    getHotVersion: function (ver) {
        let dealver = 'v' + pushZero(ver || this.version).replace('.', '_');
        hotversion = this.hotversion[dealver] || this.version;
        return hotversion;
    }
}

function pushZero(num) {
    num = "" + num;
    for (; num.length < 4;) {
        num = num + "0";
    }
    return num;
}
