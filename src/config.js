module.exports = {
    url: "https://blog.icodef.com:8081/",
    version: 2.08,
    update: 'https://github.com/CodFrm/cxmooc-tools/releases',
    enforce: false,
    cx: {
        player: 'https://blog.icodef.com:8081/player/cxmooc-tools.swf',
        resplugin: 'https://blog.icodef.com:8081/player/ResourcePlug.swf'
    },
    injection: '',
    hotversion: {
        v2_08: 2.08,
        v2_07: 2.071,
        v2_06: 2.06,
    },
    getHotVersion: function (ver) {
        let dealver = 'v' + ('' + ver || this.version).replace('.', '_');
        hotversion = this.hotversion[dealver] || this.version;
        return hotversion;
    }
}