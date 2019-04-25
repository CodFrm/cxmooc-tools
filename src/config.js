module.exports = {
    url: "https://cx.icodef.com/",
    version: 2.08,
    update: 'https://github.com/CodFrm/cxmooc-tools/releases',
    enforce: false,
    cx: {
        player: 'https://cx.icodef.com/player/cxmooc-tools.swf',
        resplugin: 'https://cx.icodef.com/player/ResourcePlug.swf'
    },
    injection: '',
    hotversion: {
        v2_08: 2.082,
        v2_07: 2.071,
        v2_06: 2.06,
    },
    getHotVersion: function (ver) {
        let dealver = 'v' + ('' + ver || this.version).replace('.', '_');
        hotversion = this.hotversion[dealver] || this.version;
        return hotversion;
    }
}