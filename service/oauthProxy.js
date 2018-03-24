/**
 * Created by zy8 on 2017/1/9.
 */
const config = require('../config')();
const {
    isInArray,
    createUUID,
    hash,
    redis
}= require('../util');


module.exports = {
    /**
     * @param  oauthPlatformType （授权平台类型， 值为WeChat, QQ, SinaWeiBo）
     * @param appName (使用该接口的app Name)
     * @param cId (客户Id)
     * @returns
     * {
     *    appId: '',
     *    appSerect:'',
     *
     * }
     */
    getOauthInfo: function*(oauthPlatformType, appName, cId) {
        console.log('getOauthInfo method start');
        let oauthInfo = {};
        if (!isInArray(oauthPlatformType, config.oauthTypeList)) {
            // error oauthPlatformType
            throw new Error('error oauthPlatformType');
        }
        let thirdPartyOauth = require('./' + oauthPlatformType + 'Oauth.js');
        oauthInfo = yield thirdPartyOauth.getOauthInfo(appName, cId);
        return oauthInfo;
    },


    /**
     * @param oauthPlatformType （授权平台类型， 值为WeChat, QQ, SinaWeiBo）
     * @param scope (可选，值为 basic ， user_info, 默认为user_info) （权限范围， user_info拿到用户信息后302， basic是拿到openid（uid）后直接302）
     * @param reqInfo 请求startOauth接口的req
     * @param oauthInfo appId等授权所需的信息
     * @returns {*}
     */
    startOauth: function*(oauthPlatformType, scope, reqInfo, oauthInfo) {
        console.log('startOauth method start');
        //1 生产sessionCode
        let sessionCode = this.createSessionCode(oauthPlatformType);
        console.log('sessionCode is ' + sessionCode);
        //2 以sessionCode为key，reqInfo为value存储发起oauth的数据
        yield this.setStartOauthInfo(sessionCode, JSON.parse(JSON.stringify(reqInfo)));
        //3 生成真正发起oauth的url
        if (!isInArray(oauthPlatformType, config.oauthTypeList)) {
            // error oauthPlatformType
            throw new Error('error oauthPlatformType');
        }
        let thirdPartyOauth = require('./' + oauthPlatformType + 'Oauth');
        let startOauthUrl = thirdPartyOauth.getStartOauthUrl(sessionCode, oauthInfo, scope);
        return startOauthUrl;
    },

    /**
     * 生成sessionId （oauthPlatformType + _ +  md5(uuid)
     * @param oauthPlatformType （授权平台类型， 值为WeChat, QQ, SinaWeiBo）
     * @returns string
     */
    createSessionCode(oauthPlatformType) {
        let uuid = createUUID();
        return oauthPlatformType + '_' + hash(uuid);
    },

    /**
     * @param sessionCode 发起授权时传入的信息存储在redis中的key
     * @param startOauthInfo 发起授权时传入的信息
     * @returns {*}
     */
    setStartOauthInfo: function*(sessionCode, startOauthInfo) { //TODO:设置过期时间
        return yield redis.hmset(config.startOauthKeyPre + sessionCode, startOauthInfo);
        // return new Promise((resolve, reject) => {
        //     redis.hmset(config.startOauthKeyPre + sessionCode, startOauthInfo, (err) => {
        //         if (err) {
        //             return reject(err);
        //         }
        //         return resolve();
        //     });
        // });
    },


    // /**
    //  * @param sessionCode 发起授权时传入的信息存储在redis中的key
    //  * @returns {*}
    //  */
    // getStartOauthInfo(sessionCode) {
    //     console.log('getStartOauthInfo method start');
    //     return new Promise((resolve, reject) => {
    //         redis.hgetall(config.startOauthKeyPre + sessionCode, (err, val) => {
    //             if (err) {
    //                 return reject(err);
    //             }
    //             return resolve(val);
    //         });
    //     });
    // },

    /**
     * @param sessionCode 发起授权时传入的信息存储在redis中的key
     * @returns {*}
     */
    getStartOauthInfo: function*(sessionCode) {
        console.log('getStartOauthInfo method start');
        let startOauthInfo = yield this.getStartOauthInfoBySessionCode(sessionCode);
        if (startOauthInfo === null || startOauthInfo === undefined) {
            throw new Error('sessionCode is not allow');
        }
        if (!startOauthInfo.hasOwnProperty('appName') || !startOauthInfo.hasOwnProperty('cId') || !startOauthInfo.hasOwnProperty('redirect_uri') || !startOauthInfo.hasOwnProperty('scope')) {
            throw new Error('no appName or cId or redirect_uri or scope in startOauthInfo');
        }
        return startOauthInfo;
    },

    /**
     * @param sessionCode 发起授权时传入的信息存储在redis中的key
     * @returns {*}
     */
    getStartOauthInfoBySessionCode: function*(sessionCode) {
        console.log('getStartOauthInfoBySessionCode method start');
        return yield redis.hgetall(config.startOauthKeyPre + sessionCode);
        // return new Promise((resolve, reject) => {
        //     redis.hgetall(config.startOauthKeyPre + sessionCode, (err, val) => {
        //         if (err) {
        //             return reject(err);
        //         }
        //         return resolve(val);
        //     });
        // });
    },

    /**
     * @param oauthPlatformType （授权平台类型， 值为WeChat, QQ, SinaWeiBo）
     * @param  code （授权平台请求过来的code，用于获取access_token
     * @param startOauthInfo 发起授权时传入的信息
     * @param sessionCode 发起授权时传入的信息存储在redis中的key
     * @returns {*}
     */
    getUserInfo: function*(oauthPlatformType, code, startOauthInfo, sessionCode) {
        console.log('getUserInfo method start');
        if (!isInArray(oauthPlatformType, config.oauthTypeList)) {
            // error oauthPlatformType
            throw new Error('error oauthPlatformType');
        }
        let thirdPartyOauth = require('./' + oauthPlatformType + 'Oauth');
        let userInfo = yield thirdPartyOauth.getUserInfo(code, startOauthInfo, sessionCode);
        return userInfo;
    },

    /**
     * @param redirect_uri （回调初始uri）
     * @param scope (可选，值为 basic ， user_info, 默认为user_info) （权限范围， user_info拿到用户信息后302， basic是拿到openid（uid）后直接302）
     * @param userInfo 用户信息
     * @param oauthPlatformType
     * @returns {*}
     */
    getBackUrl(redirect_uri, scope, userInfo, oauthPlatformType) {
        console.log('getBackUrl method start');
        let openid = userInfo.openid;
        let appId;
        if(oauthPlatformType === 'WeChat'){
            appId = config.WECHATCONFIG.appId;
        }else if(oauthPlatformType === 'QQ'){
            appId = config.QQCONFIG.appId;
        }else {
            // sina
            appId = config.SINAWEIBOCONFIG.appId;
        }
        let backUrl = redirect_uri.indexOf('?') === -1 ? redirect_uri + '?openid=' + openid + '&appId=' + appId  : redirect_uri + '&openid=' + openid + '&appId=' + appId ;
        if ('user_info' === scope) {
            let nickname = encodeURIComponent(userInfo.nickname);
            let headImgUrl = encodeURIComponent(userInfo.headimgurl);
            backUrl = backUrl + '&nickname=' + nickname + '&headImgUrl=' + headImgUrl;
        }
        return backUrl;
    }

};