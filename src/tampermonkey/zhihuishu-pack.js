import './common';
const zhihuishu = require('../cxmooc-tools/zhihuishu/zhihuishu');

if (window.location.href.indexOf('zhihuishu.com/learning/videoList') > 0) {
    zhihuishu.video();
}