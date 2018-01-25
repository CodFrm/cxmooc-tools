window.onload = function () {
    //注入mooc.js
    injected('mooc.js');
    injected('md5.js');
}

function injected(file) {
    var path = 'js/' + file;
    var temp = document.createElement('script');
    temp.setAttribute('type', 'text/javascript');
    temp.src = chrome.extension.getURL(path);
    document.head.appendChild(temp);
}