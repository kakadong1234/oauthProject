const config = require('../config')();
const {hash} = require('../util');

module.exports = (req, res, next) => {
    if (isNoAuthFile(req.url)) {
        return next();
    }

    let token = getValueByReq(req, 'token');
    let stamp = getValueByReq(req, 'ts');
    console.log(token);
    console.log(stamp);
    if (!token || !stamp
        || !checkToken(token, stamp)
        || !checkStamp(stamp)) {
        return next(new Error('身份验证失败'));
    }

    next();
};

/**
 * 不用身份验证的路径或文件
 * 根节点用来检查服务状态,跳过身份验证
 * @param url 请求url
 * @returns {boolean}
 */
function isNoAuthFile(url) {
    return url == '/' || url.indexOf('/oauthCallBack') != -1 || /.ico/.test(url); //TODO:ts和token要加上的
}


/**
 * 中req中获取field中对应值
 * @param req
 * @param field
 * @returns {string}
 */
function getValueByReq(req, field) {
    if (req.header(field)) {
        return req.header(field);
    }
    else {
        console.log(req.method);
        if ('GET' === req.method) {
            return req.query[field];
        }
        else if ('POST' === req.method) {
            return req.body[field];
        }
        else {
            return undefined;
        }
    }
}

/**
 * 判断客户端和服务器hash的token是否匹配
 * @param token 客户端传来的token
 * @returns {boolean}
 */
function checkToken(token, stamp) {
    for (let field of Object.keys(config.TOKEN)) {
        if (hash(config.TOKEN[field] + stamp) == token) return true;
    }
}

/**
 * 通过时间戳判断是否是五分钟内的请求
 * @param stamp 客户端传来的时间戳
 * @returns {boolean}
 */
function checkStamp(stamp) {
    let current = new Date().getTime();
    let diffSecs = current - stamp;
    return Math.abs(diffSecs) < config.tsInterval;
}