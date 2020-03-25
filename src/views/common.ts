window.addEventListener("load", () => {
    let css = `#cxtools {
    position: absolute;
    left: 250px;
    top: 2px;
    width: 120px;
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

#zhs-video-boom {
    color: #fff;
    background: #ff9d34;
    padding: 4px;
}

#zhs-video-boom:hover {
    background: #ff3838;
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
    width: 300px;
    text-align: center;
    overflow: hidden;
    left:50%;
    margin-left:-150px;
    z-index: 100000;
    background: #e4e4e4;
    opacity: .8;
}

.tools-notice-content{
    height: 26px;
    padding: 4px;
    border-top: 1px solid;
}
`
    let style = document.createElement("style");
    style.innerHTML = css;
    document.body.appendChild(style);
});