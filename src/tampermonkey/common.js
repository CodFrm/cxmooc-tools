global.config = JSON.parse(localStorage['config']);

Object.defineProperty(global.config, 'duration', {
    get: function () {
        return (config.interval || 0.1) * 60000;
    }
});
