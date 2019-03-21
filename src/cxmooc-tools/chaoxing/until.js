const chaoxing = require('./chaoxing');

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
 * 创建一行
 * @param {string} text 
 */
export function createLine(text, label, append) {
    let p = $('<p></p>');
    p.css('color', 'red');
    p.css('font-size', '14px');
    p.attr('class', 'prompt-line-' + label);
    p.text(text);
    if (append != undefined) {
        $(append).append(p);
    }
    return p;
}

export function isFinished(el) {
    if ($(el).parents('.ans-attach-ct.ans-job-finished').length > 0) {
        return true;
    }
    return false;
}

export function isTask(el) {
    if ($(el).parents('.ans-attach-ct').find('.ans-job-icon').length > 0) {
        return true;
    }
    return false;
}


export function pop_prompt(text, sec = 4) {
    var box = document.createElement('div');
    box.style.position = "absolute";
    box.style.background = "#aeffab";
    box.style.fontSize = "18px";
    box.style.padding = "4px 20px";
    box.style.borderRadius = "20px";
    box.style.top = "50%";
    box.style.left = "50%";
    box.style.transform = "translate(-50%,-50%)";
    box.style.transition = "1s";
    box.style.opacity = "0";
    box.innerText = text;
    setTimeout(function () {
        box.style.opacity = "0";
        setTimeout(function () {
            box.remove();
        }, 1000)
    }, sec * 1000);
    return box;
}
