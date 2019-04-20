global.config = JSON.parse(localStorage['config']);
config.duration = (config.interval || 0.1) * 60000;
