/**
 * 美化按钮
 * @param btn 按钮
 */
export function CssBtn(btn: HTMLButtonElement): HTMLButtonElement {
    btn.style.position = 'relative';
    btn.style.color = '#fff';
    btn.style.padding = '0 16px';
    btn.style.display = 'inline-block';
    btn.style.height = '36px';
    btn.style.fontSize = '14px';
    btn.style.fontWeight = '500';
    btn.style.outline = 'none';
    btn.style.border = 'none';
    btn.style.borderRadius = '4px';
    btn.style.overflow = 'hidden';
    btn.style.margin = '0 8px';

    btn.addEventListener('mousedown', (e: MouseEvent) => {
        let x = e.offsetX;
        let y = e.offsetY;
        let ripples = document.createElement('span');
        ripples.style.left = x + 'px';
        ripples.style.top = y + 'px';
        ripples.className = "btn-ripple";
        btn.appendChild(ripples);
        setTimeout(() => {
            ripples.remove();
        }, 1000);
    }, false)
    return btn;
}