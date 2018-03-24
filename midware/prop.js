const config = require('../config')();
const {hash} = require('../util');

module.exports = (req, res, next) => {

    //设置一些request级别的变量,方便后续使用
    req.isFromLEJU = isFromLEJU(req);

    next();
};

function isFromLEJU(req) {
    return hash(config.TOKEN.LEJU + req.header('ts')) != req.header('token');
}