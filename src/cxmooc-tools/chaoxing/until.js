const chaoxing = require('./chaoxing');

/**
 * 工厂
 * @param {string} object 
 * @return plugin
 */
export function factory(object) {
    switch (object) {
        case 'chaoxing': {
            return new chaoxing();
        }
    }
}

/**
 * 创建一个按钮
 * @param {*} title 
 */
export function createBtn(title, description = '', id = '') {
    let btn = document.createElement('button');
    btn.innerText = title;
    btn.id = id;
    btn.style.outline = 'none';
    btn.style.border = '0';
    btn.style.background = '#7d9d35';
    btn.style.color = '#fff';
    btn.style.borderRadius = '4px';
    btn.style.padding = '2px 8px';
    btn.style.cursor = 'pointer';
    btn.style.fontSize = '12px';
    btn.style.marginLeft = '4px';
    btn.title = description;
    btn.onmousemove = () => {
        btn.style.boxShadow = '1px 1px 1px 1px #ccc';
    };
    btn.onmouseout = () => {
        btn.style.boxShadow = '';
    };
    return btn;
}

/**
 * 处理任务点标签
 * @param string label 
 */
export function dealTaskLabel(label) {
    $(label).css('text-align', 'center');
    $(label).css('width', 'auto');
    let span = $(label).find('span');
    span.css('width', 'auto');
    span.css('margin-left', '0');
}

/**
 * get请求
 * @param {*} url 
 */
export function get(url, success) {
    try {
        var xmlhttp = createRequest();
        xmlhttp.open("GET", url, true);
        xmlhttp.send();
    } catch (e) {
        return false;
    }
    xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (this.status == 200) {
                success(this.responseText);
            }
        }
    }
    return xmlhttp;
}

/**
 * post请求
 * @param {*} url 
 * @param {*} data 
 * @param {*} json 
 */
export function post(url, data, json = true, success) {
    try {
        var xmlhttp = createRequest();
        xmlhttp.open("POST", url, true);
        if (json) {
            xmlhttp.setRequestHeader("Content-Type", "application/json");
        } else {
            xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        }
        xmlhttp.send(data);
    } catch (e) {
        return false;
    }
    xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (this.status == 200) {
                success(this.responseText);
            }
        }
    }
    return xmlhttp;
}

/**
 * 创建一行
 * @param {string} text 
 */
export function createLine(text, label) {
    let p = $('<p></p>');
    p.css('color', 'red');
    p.css('font-size', '14px');
    p.attr('class', 'prompt-line-' + label);
    p.text(text);
    return p;
}

/**
 * 去除html标签和处理中文
 * @param {string} html 
 */
export function removeHTML(html) {
    //先处理img标签
    var imgReplace = /<img .*?src="(.*?)".*?>/g;
    html = html.replace(imgReplace, '$1');
    var revHtml = /<.*?>/g;
    html = html.replace(revHtml, '');
    html = html.replace(/(^\s+)|(\s+$)/g, '');
    html = dealSymbol(html);
    return html.replace(/&nbsp;/g, ' ');
}

/**
 * 处理符号
 * @param {*} topic 
 */
function dealSymbol(topic) {
    topic = topic.replace('，', ',');
    topic = topic.replace('（', '(');
    topic = topic.replace('）', ')');
    topic = topic.replace('？', '?');
    topic = topic.replace('：', ':');
    topic = topic.replace(/[“”]/g, '"');
    return topic;
}

export function isFinished(el) {
    if ($(el).parents('.ans-attach-ct.ans-job-finished').length > 0) {
        return true;
    }
    return false;
}

export function isTask(el) {
    if ($(el).parents('.ans-attach-ct.ans-job-finished').find('.ans-job-icon').length > 0) {
        return true;
    }
    return false;
}

