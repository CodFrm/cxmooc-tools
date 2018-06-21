const common = require('./common');
chrome.storage.local.get([
    'topic_regx',
    'topics',
    'topic_time'
], function (items) {
    //读取题库信息
    document.getElementById('regx').value=items.topic_regx;
    document.getElementById('content').value=items.topics;
});

document.getElementById('submit').onclick = function () {
    chrome.storage.local.set({
        'topic_regx': document.getElementById('regx').value,
        'topics': document.getElementById('content').value,
        'topic_time': Date.parse(new Date())
    }, function () {
        alert('保存成功');
    });
}

document.getElementById('test').onclick = function () {
    var reg = new RegExp(common.dealRegx(document.getElementById('regx').value, document.getElementById('topic').value));
    console.log(reg);
    var str = document.getElementById('content').value;
    var arr = reg.exec(str);
    if (arr != null) {
        document.getElementById('result').innerHTML = '匹配内容:<br />' + arr[0];
        document.getElementById('result').innerHTML += '<br /><br /><span style="color:red;">匹配答案:' + (arr.length >= 2 ? arr[1] : '') + '</span>';
    }

}