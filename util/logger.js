let fs = require('fs');
let log4js = require('log4js');
const config = require('../config')();

let appenders = [{
    type: 'dateFile',
    category: 'service',
    filename: `${config.LOG_PATH}/`,
    pattern: 'yyyyMMdd.log',
    alwaysIncludePattern: true
}];

//开发环境日志同时输出到console
!config.DEBUG || appenders.push({type: 'console'});

//如果日志目录不存在则创建
fs.existsSync(config.LOG_PATH) || fs.mkdirSync(config.LOG_PATH);

log4js.configure({appenders});
let logger = log4js.getLogger('service');
logger.setLevel('INFO');

module.exports = logger;