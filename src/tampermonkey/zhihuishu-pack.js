const zhihuishu = require('../cxmooc-tools/zhihuishu/zhihuishu');

global.config = JSON.parse(localStorage['config']);
global.vtoken = config.vtoken;

if (window.location.href.indexOf('zhihuishu.com/learning/videoList') > 0) {
    zhihuishu.video.start();
}
