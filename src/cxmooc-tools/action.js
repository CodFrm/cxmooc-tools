/**
 * 框架(iframe)内操作js
 */

/**
 * 开始监控暂停,自动重新播放
 */
window.monitorPlay = function () {
    var player = document.querySelector('object');
    var reader = player.parentNode.parentNode;
    play();
    $(reader).bind('onPause', function (h, g) {
        play();
    });

    function play() {
        var time = setInterval(function () {
            if (player.getPlayState() != 1) {
                player.playMovie();
            } else {
                clearInterval(time);
            }
        }, 1000);
    }
}