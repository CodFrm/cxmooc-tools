window.addEventListener("load", () => {
    let css = `#cxtools {
    position: absolute;
    left: 250px;
    top: 2px;
    width: 200px;
    font-size: 0;
}

.cx-btn {
    outline: none;
    border: 0;
    background: #7d9d35;
    color: #fff;
    border-radius: 4px;
    padding: 2px 8px;
    cursor: pointer;
    font-size: 12px;
    margin-left: 4px;
}

.cx-btn:hover {
    box-shadow: 1px 1px 1px 1px #ccc;
}

.zhs-tools-btn {
    color: #fff;
    background: #ff9d34;
    padding: 4px;
    display: inline-block;
    height: 24px;
    font-size: 14px;
    line-height: 24px;
    margin:0;
}

.zhs-tools-btn:hover {
    background: #ff3838;
}

.zhs-start-btn{
    background: #36ac36;
}

.zhs-start-btn:hover{
    background: #3b8d3b;
}

#zhs-ytbn {
    color: #fff;
    background: #e777ff;
}

#zhs-ytbn:hover {
    background: #e7b7f1;
}

.zhs-search-answer {
    border: 0;
    outline: none;
    padding: 4px;
}

.zhs-search-answer:hover {
    opacity: .85;
}

.mooc163-search{
    background-color: #60b900;
    display: block;
    margin: 0 auto;
}

.tools-logger-panel{
    position: fixed;
    color: red;
    margin: 0 auto;
    display: block;
    font-size: 14px;
    border: 1px solid #ff482b;
    border-radius: 4px;
    width: 340px;
    text-align: center;
    overflow: hidden;
    left:50%;
    margin-left:-170px;
    z-index: 100000;
    background: #e4e4e4;
    opacity: .8;
    top: 40px;
}

.tools-notice-content{
    height: 26px;
    padding: 4px;
    border-top: 1px solid;
}

.tools-logger-panel {
    background-color: rgba(228, 228, 228, .5);
    opacity: .25;
    transition-property: opacity, background-color;
    transition: 200ms ease-in-out;
}

.tools-logger-panel:hover,
.tools-logger-panel:focus-within {
    background-color: rgba(228, 228, 228, .75);
    opacity: 1;
}

.tools-logger-panel:active {
    background-color: #E5E5E5;
}

.tools-logger-panel > .close {
    margin: 2px;
}

`
    let style = document.createElement("style");
    style.innerHTML = css;
    document.body.appendChild(style);
});