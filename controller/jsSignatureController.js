/**
 * Created by zy8 on 2017/5/9.
 */
const co = require('co');
const {logger} = require('../util');
const config = require('../config')();
const {
    ticketService,
} = require('../service');
const {
    toolset
} = require('../util');

module.exports = {

    getUniqueSource: (req, res, next) => {
        co(function *() {
            const uniqueSourceAccessToken = yield ticketService.getUniqueSourceFromDB(config.uniqueSourceAccessTokenRedisKey);
            if(!uniqueSourceAccessToken) {
                return res.json({
                        code: -1,
                        msg: 'accessToken setTimeOut error, please restart app'
                    }
                )
            }
            const uniqueSourceJsApiTicket = yield ticketService.getUniqueSourceFromDB(config.uniqueSourceJsApiTicketRedisKey);
            if(!uniqueSourceJsApiTicket) {
                return res.json({
                        code: -1,
                        msg: 'jsApiIicket setTimeOut error, please restart app'
                    }
                )
            }
            return res.json({
                    code: 1,
                    msg: 'success'
                }
            )
        }).catch(error);
        function error(err) {
            logger.info(err.message);
            next(err);
        }

    },

    getJsApiSignature: (req, res, next) => {
        co(function *() {
            const timestamp = parseInt(Date.now() / 1000);
            const noncestr = toolset.getNoncestr();
            const url = req.query.url; //TODO
            const signatureArgs = {
                url,
                timestamp,
                noncestr,
                jsapi_ticket: (yield ticketService.getJsApiTicketFromDB(config.jsApiTicketRedisKey)).ticket
            };

            console.log(signatureArgs);
            //步骤1. 对所有待签名参数按照字段名的ASCII 码从小到大排序（字典序）后，使用URL键值对的格式（即key1=value1&key2=value2…）拼接成字符串string1
            const sha1Key = raw(signatureArgs);
            //步骤2. 对string1进行sha1签名，得到signature
            const signature = toolset.sha1Encrypt(sha1Key);
            return res.json({
                    code: 1,
                    msg: 'success',
                    data: {
                        appId: config.WECHATCONFIG.appId,
                        signature: signature,
                        nonceStr: noncestr,
                        timestamp: timestamp,
                        url: url
                    }
                }
            )
        }).catch(error);
        function error(err) {
            logger.info(err.message);
            next(err);
        }

    },
};

var raw = function (args) {
    var keys = Object.keys(args);
    keys = keys.sort();
    var newArgs = {};
    keys.forEach(function (key) {
        newArgs[key.toLowerCase()] = args[key];
    });

    var string = '';
    for (var k in newArgs) {
        string += '&' + k + '=' + newArgs[k];
    }
    string = string.substr(1);
    return string;
};