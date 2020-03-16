import './common';
const zhihuishu = require('../cxmooc-tools/zhihuishu/zhihuishu');

if (window.location.href.indexOf('zhihuishu.com/learning/videoList') > 0) {
    zhihuishu.video();
} else if (window.location.href.indexOf('stuExamWeb.htm') > 0) {
    zhihuishu.stuExam();
} else if (window.location.href.indexOf('zhihuishu.com/videoStudy.html') > 0) {
    //新版智慧树
    zhihuishu.video();
}