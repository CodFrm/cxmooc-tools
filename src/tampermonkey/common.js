global.config = JSON.parse(localStorage['config']);
global.vtoken = config.vtoken;
config.duration = (config.interval || 0.1) * 60000;

