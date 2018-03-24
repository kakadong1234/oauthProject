/**
 * Created by zy8 on 2017/1/5.
 */
module.exports = (() => {
    let _config;

    return function () {
        if (!_config) {
            try {
                _config = require('../config/base');
                // 先中pm2的config中取env值，没有的话，再从node的启动argv中取env，没有的话默认pro
                const env = (process.env.NODE_ENV && _config.ALL_ENVS.indexOf(process.env.NODE_ENV) !== -1) ? process.env.NODE_ENV : ((process.argv.length > 2 && _config.ALL_ENVS.indexOf(process.argv[2]) !== -1) ? process.argv[2] : _config.DEFAULT_NODE_ENV);
                console.log('--------------------------, env is ' + env);
                const custom_config = require(`../config/${env}`);
                Object.assign(_config, custom_config)
            } catch (e) {
                console.log('Please make sure if config variable NODE_ENV is set.');
                process.exit()
            }
        }
        return _config;
    }
})()