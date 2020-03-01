
/**
 * 美化按钮
 */
export function CssBtn(btn: HTMLButtonElement): HTMLButtonElement {
    btn.style.outline = 'none';
    btn.style.border = '0';
    btn.style.background = '#7d9d35';
    btn.style.color = '#fff';
    btn.style.borderRadius = '4px';
    btn.style.padding = '2px 8px';
    btn.style.cursor = 'pointer';
    btn.style.fontSize = '12px';
    btn.style.marginLeft = '4px';
    btn.onmousemove = () => {
        btn.style.boxShadow = '1px 1px 1px 1px #ccc';
    };
    btn.onmouseout = () => {
        btn.style.boxShadow = '';
    };
    return btn;
}

export function CreateNoteLine(text: string, label: string, append?: HTMLElement, after?: HTMLElement) {
    let p = document.createElement("p");
    p.style.color = "red";
    p.style.fontSize = "14px";
    p.className = "prompt-line-" + label;
    p.innerHTML = text;
    if (append != undefined) {
        append.append(p);
    }
    if (after != undefined) {
        after.after(p);
    }
    return p;
}