/**
 * Created by zy8 on 2017/5/9.
 */
const config = require('../config')();
const {
    request_get,
    redis
}= require('../util');


module.exports = {

    /**
     * 获取accessToken from wechat
     * @param appId
     * @param secret
     * @returns {*}
     */
    getAccessTokenFromWechat: function*(appId, secret) {
        console.log('getAccessTokenFromWechatmethod start');
        //https://mp.weixin.qq.com/wiki/15/54ce45d8d30b6bf6758f68d2e95bc627.html
        // 1 url 拼装
        const url = config.wechatGetApiAccessTokenUrl + '?appid=' + appId + '&secret=' + secret + '&grant_type=client_credential';
        console.log('url is ' + url);
        const headers = {'User-Agent': 'curl/7.19.7'};
        // 2 http request
        const body = yield request_get(url, headers, '请求access_token 错误', 3);
        // 3 return json
        let data = JSON.parse(body);
        if (!data.hasOwnProperty('access_token') || !data.hasOwnProperty('expires_in')) {
            throw new Error('no access_token in  data');
        }
        return data;
    },


    /**
     * 获取JsApiTicket from wechat
     * @param accessToken
     * @returns {*}
     */
    getJsApiTicketFromWechat: function*(accessToken) {
        console.log('getJsApiTicketFromWechat start');
        //https://mp.weixin.qq.com/wiki/7/aaa137b55fb2e0456bf8dd9148dd613f.html#.E9.99.84.E5.BD.951-JS-SDK.E4.BD.BF.E7.94.A8.E6.9D.83.E9.99.90.E7.AD.BE.E5.90.8D.E7.AE.97.E6.B3.95
        // 1 url 拼装
        const url = config.wechatGetJsApiTicketUrl + '?access_token=' + accessToken + '&type=jsapi';
        console.log('url is ' + url);
        const headers = {'User-Agent': 'curl/7.19.7'};
        // 2 http request
        const body = yield request_get(url, headers, '请求js_api_ticket 错误', 3);
        // 3 return json
        let data = JSON.parse(body);
        if (!data.hasOwnProperty('ticket') || !data.hasOwnProperty('expires_in')) {
            throw new Error('no ticket in  data');
        }
        return data;
    },

    /**
     * @param key
     * 获取JsApiTicket
     */
    getJsApiTicketFromDB: function*(key) {
        console.log('getJsApiTicketFromDB method start');
        return yield redis.hgetall(key);
    },

    /**
     * @param key
     * @param data
     * 设置JsApiTicket
     */
    setJsApiTicketToDB: function*(key, data) {
        console.log('setJsApiTicketToDB method start');
        return yield redis.hmset(key, data);
    },

    /**
     * @param key
     * 获取accessToken
     */
    getAccessTokenFromDB: function*(key) {
        console.log('getAccessTokenFromDB method start');
        return yield redis.hgetall(key);
    },

    /**
     * @param key
     * @param data
     * 设置accessToken
     */
    setAccessTokenToDB: function*(key, data) {
        console.log('setAccessTokenToDB method start');
        return yield redis.hmset(key, data);
    },

    /**
     * @param key
     * 获取 get uniqueSource data
     */
    getUniqueSourceFromDB: function*(key) {
        console.log('getUniqueSourceFromDB method start');
        return yield redis.hgetall(key);
    },

    /**
     * @param key
     * @param expires_in
     * @param data
     * 设置 uniqueSource
     */
    setUniqueSourceToDB: function*(key, expires_in, data) {
        console.log('setUniqueSourceToDB method start');
        yield redis.hmset(key, data);
        yield redis.expire(key, expires_in);
    },

    /**
     * @param key
     * 获取 get getWechatUniqueSourceStarted data
     */
    getWechatUniqueSourceStartedFromDB: function*(key) {
        console.log('getWechatUniqueSourceStartedFromDB method start');
        return yield redis.hgetall(key);
    },
    /**
     * @param key
     * @param data
     * 设置 WechatUniqueSourceStarted
     */
    setWechatUniqueSourceStartedToDB: function*(key, data) {
        console.log('setWechatUniqueSourceStartedToDB method start');
        yield redis.hmset(key, data);
    },

    /**
     * @param key
     *deleteWechatUniqueSourceStarted
     */
    deleteWechatUniqueSourceStarted: function*(key) {
        console.log('deleteWechatUniqueSourceStarted method start');
        yield redis.delete(key);
    },
};
