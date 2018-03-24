/**
 * Created by zy8 on 2017/1/5.
 */
let toolset = require('./toolset');
module.exports = {
    isInArray: toolset.isInArray,
    createUUID: toolset.createUUID,
    hash: toolset.hash,
    redis: require('./redisClient'),
    request_get: toolset.fetchPlayDataFromWebByGET,
    request_post: toolset.fetchPlayDataFromWebByPost,
    validhelper: require('./validHelper'),
    customValidators: require('./customValidators'),
    logger: require('./logger'),
    toolset: toolset
};