import '../tampermonkey/cxmooc-pack';
import '../tampermonkey/zhihuishu-pack';
import '../tampermonkey/icourse163-pack';
const common = require('./common');
common.removeinjected(document);

common.serverMessage('cxconfig', function (param) {
    global.config[param.key] = param.value;
});
