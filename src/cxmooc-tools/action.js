/**
 * 框架(iframe)内操作js
 */

/**
 * 开始监控暂停,自动重新播放
 */
window.monitorPlay = function () {
    console.log("挂机呗按下");
    var player = document.querySelector('object');
    var reader = player.parentNode.parentNode;
    player.playMovie();
    $(reader).bind('onPause', function (h, g) {
        player.playMovie();
    });
}