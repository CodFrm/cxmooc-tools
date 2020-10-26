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
    width: 360px;
    height: auto;
    max-height: 260px;
    color:#000;
    position: fixed;
    margin: 0 auto;
    display: block;
    font-size: 14px;
    border-radius: 4px;
    width: 340px;
    text-align: center;
    overflow: hidden;
    left:60px;
    top: 40px;
    z-index: 100000;
    background: rgba(256, 256, 256, 0.3);
    box-shadow: 0px 0px 5px #bbb;
}

.head {
    width: 100%;
    height: 30px;
    padding: 4px;
    box-sizing: border-box;
    cursor: move;
    transition-property: opacity, background-color;
    transition: 200ms ease-in-out;
}

.head span{
    color:#000;
    float:left;
    font-weight: 550;
}

.status {
    color: #67C23A;
    font-weight: 600;
}

.tools-notice-content {
    width: 100%;
    height: 220px;
    border-top:0px;
    overflow-y: scroll;
    overflow-x: hidden;
}

.tools-notice-content .log {
    height: auto;
    width: auto;
    text-align: center;
    border: 1px solid #eee;
    overflow: hidden;
}

.tools-notice-content .log p {
    margin: 0;
    color: #aaa;
    font-size: 11px;
    font-weight: 500;
    font-family: Arial, Helvetica, sans-serif;
    line-height: 26px;
}

/* 滚动槽 */
::-webkit-scrollbar {
    width: 10px;
    height: 10px;
}

::-webkit-scrollbar-track {
    border-radius: 3px;
    background: rgba(0, 0, 0, 0.06);
    -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.08);
}

/* 滚动条滑块 */
::-webkit-scrollbar-thumb {
    border-radius: 3px;
    background: rgba(0, 0, 0, 0.12);
    -webkit-box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.2);
}

/* 复选框 */
.switch {
    margin: 2px auto;
    display: inline-flex;
    align-items: center;
    width: auto;
}
.checkbox-input {
    display: none
}
.checkbox {
    -webkit-transition: background-color 0.3s;
    transition: background-color 0.3s;
    background-color: #fff;
    border: 1px solid #d7d7d7;
    border-radius: 50px;
    width: 16px;
    height: 16px;
    vertical-align:middle;
    margin: 0 5px;
}
.checkbox-input:checked+.checkbox {
    background-color: #409EFF;
}
.checkbox-input:checked+.checkbox:after {
    // content: "√";
    display: inline-block;
    height: 100%;
    width: 100%;
    color: #fff;
    text-align: center;
    line-height: 16px;
    font-size: 12px;
    box-shadow: 0 0 4px #409EFF;
}

.tools-logger-panel:hover,
.tools-logger-panel:focus-within {
    background: rgba(256, 256, 256, 0.7);
}

.tools-logger-panel .head:active {
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
