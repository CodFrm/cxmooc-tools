const moocConfig = require('../config');
window.onload = function () {
    document.getElementById('version').innerHTML='v'+moocConfig.version;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", moocConfig.url + 'update', true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            if (this.status == 200) {
                var json = JSON.parse(this.responseText);
                if (moocConfig.version < json.version) {
                    var p = document.createElement('p');
                    p.style.color="#ff0000";
                    p.innerHTML = '有新的版本更新:<a href="'+json.url+'" style="float:right;">点我去下载</a>  最新版本:v'+json.version;
                    document.getElementsByTagName('body')[0].appendChild(p);
                }
            }
        }
    }
    xhr.send();
}