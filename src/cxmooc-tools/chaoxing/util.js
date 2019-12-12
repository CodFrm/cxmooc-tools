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

let symbolMap = {
    "，": ",", "。": ".", "（": "(", "）": ")",
    "？": "?", "：": ":", "“": "\"", "”": "\"",
}

export function dealSpecialSymbol(str) {
    let ret = ""
    for (var i = 0; i < str.length; i++) {
        if (symbolMap[str[i]] !== undefined) {
            ret += symbolMap[str[i]]
        } else {
            ret += str[i]
        }
    }
    return ret
}