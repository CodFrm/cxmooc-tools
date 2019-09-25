const common = require('../cxmooc-tools/common')

global.config = JSON.parse(localStorage['config']);
config.duration = (config.interval || 0.1) * 60000;

Object.defineProperty(global.config, 'duration', {
    get: function () {
        let interval = (config.interval || 0.1) * 60000;
        return common.randNumber(interval - interval / 2, interval + interval / 2);
    }
});