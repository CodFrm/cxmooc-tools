window.onload = function () {
    //注入mooc.js
    injected(document, 'mooc.js');
    document.head.setAttribute('chrome-url', chrome.extension.getURL(''));
}

function injected(doc, file) {
    var path = 'src/' + file;
    var temp = doc.createElement('script');
    temp.setAttribute('type', 'text/javascript');
    temp.src = chrome.extension.getURL(path);
    doc.head.appendChild(temp);
}