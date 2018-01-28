window.onload = function () {
    //注入mooc.js
    injected('md5.js');
    injected('mooc.js');
}

function injected(file) {
    var path = 'src/' + file;
    var temp = document.createElement('script');
    temp.setAttribute('type', 'text/javascript');
    temp.src = chrome.extension.getURL(path);
    document.head.appendChild(temp);
}