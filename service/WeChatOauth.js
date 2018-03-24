/**
 * Created by zy8 on 2017/1/9.
 */
const config = require('../config')();
const {
    request_get
}= require('../util');
module.exports = {
    /**
     * 获取appid和secret等信息
     * @param appName (使用该接口的app Name)
     * @param cId (客户Id)
     * @returns
     * {
     *    appId: '',
     *    appSerect:'',
     *
     * }
     */
    getOauthInfo: function*(appName, cId) {
        console.log('getOauthInfo method start');
        // 微信
        let oauthInfo = {
            appId: config.WECHATCONFIG.appId,
            appSecret: config.WECHATCONFIG.appSecret
        };
        return oauthInfo;
    },


    /**
     * 获取发起Oauth的url(拼装url)
     * @param sessionCode 发起授权时传入的信息存储在redis中的key
     * @param oauthInfo appId等授权所需的信息
     * @param ascope (可选，值为 basic ， user_info, 默认为user_info) （权限范围， user_info拿到用户信息后302， basic是拿到openid（uid）后直接302）
     * @returns {*}
     */
    getStartOauthUrl(sessionCode, oauthInfo, ascope){
        console.log('getStartOauthUrl method start');
        //https://open.weixin.qq.com/connect/oauth2/authorize?appid=APPID&redirect_uri=REDIRECT_URI&response_type=code&scope=SCOPE&state=STATE#wechat_redirect
        let redirect_uri = config.oauthBackUrl + '?sessionCode=' + sessionCode + '&oauthPlatformType=' + 'WeChat';
        let scope = this.getScope(ascope);
        let oauthBackUrl = config.wechatAuthorizeUrl + '?appid=' + oauthInfo.appId + '&redirect_uri=' + encodeURIComponent(redirect_uri) + '&response_type=code&scope=' + scope + '&state=STATE#wechat_redirect';
        console.log('oauthBackUrl is ' + oauthBackUrl);
        return oauthBackUrl;
    },


    /**
     * 获取发起微信Oauth的url所需的scope参数
     * @param inputScope (可选，值为 basic ， user_info, 默认为user_info) （权限范围， user_info拿到用户信息后302， basic是拿到openid（uid）后直接302）
     * @returns string
     */
    getScope(inputScope) {
        if ('basic' === inputScope) {
            return 'snsapi_base';
        }
        else if ('user_info' === inputScope) {
            return 'snsapi_userinfo';
        }
        else {
            throw  new Error('no allow scope, input scope is ' + inputScope);
        }
    },

    /**
     * @param  code （授权平台请求过来的code，用于获取access_token
     * @param startOauthInfo 发起授权时传入的信息
     * @param sessionCode 发起授权时传入的信息存储在redis中的key
     * @returns {*}
     */
    getUserInfo: function*(code, startOauthInfo, sessionCode) {
        console.log('getUserInfo method start');
        // 1 获取appId 和 Secret
        if (!startOauthInfo.hasOwnProperty('appName') || !startOauthInfo.hasOwnProperty('cId') || !startOauthInfo.hasOwnProperty('redirect_uri') || !startOauthInfo.hasOwnProperty('scope')) {
            throw new Error('no appName or cId or redirect_uri or scope in startOauthInfo');
        }
        let appName = startOauthInfo.appName;
        let cId = startOauthInfo.cId;
        let redirect_uri = startOauthInfo.redirect_uri;
        let scope = startOauthInfo.scope;
        let oauthInfo = yield this.getOauthInfo(appName, cId);
        console.log(oauthInfo);
        // 2 根据code，换取access_token
        if (!oauthInfo.hasOwnProperty('appId') || !oauthInfo.hasOwnProperty('appSecret')) {
            throw new Error('no appId or appSecret in  oauthInfo');
        }
        let openIdInfo = yield this.getAccessTokenAndOpenId(code, oauthInfo.appId, oauthInfo.appSecret);
        console.log(openIdInfo);
        // if (!openIdInfo.hasOwnProperty('openid') || !openIdInfo.hasOwnProperty('access_token')) {
        //     return reject(new Error('no openid or  access_token in  openIdInfo'));
        // }
        let openid = openIdInfo.openid;
        let access_token = openIdInfo.access_token;
        let userInfo = {
            openid: openid
        };
        if ('user_info' === scope) {
            // 3 获取用户信息
            let userInfoByRequest = yield this.getUserInfoByAccessTokenAndOpenId(access_token, openid);
            console.log(userInfoByRequest);
            // if (!userInfoByRequest.hasOwnProperty('nickname') || !userInfoByRequest.hasOwnProperty('headimgurl')) {
            //     return reject(new Error('no nickname or  headimgurl in  userInfoByRequest'));
            // }
            userInfo.nickname = userInfoByRequest.nickname;
            userInfo.headimgurl = userInfoByRequest.headimgurl;
        }
        return userInfo;
    },

    /**
     * 获取accessToken和openid
     * @param  code （授权平台请求过来的code，用于获取access_token）
     * @param appId
     * @param secret
     * @returns {*}
     */
    getAccessTokenAndOpenId: function*(code, appId, secret) {
        console.log('getAccessTokenAndOpenId method start');
        //https://api.weixin.qq.com/sns/oauth2/access_token?appid=APPID&secret=SECRET&code=CODE&grant_type=authorization_code
        // 1 url 拼装
        let url = config.wechatGetAccessTokenUrl + '?appid=' + appId + '&secret=' + secret + '&code=' + code + '&grant_type=authorization_code';
        console.log('url is ' + url);
        let headers = {'User-Agent': 'curl/7.19.7'};
        // 2 http request
        let body = yield request_get(url, headers, '请求access_token 错误', 3);
        // 3 return json
        let data = JSON.parse(body);
        if (!data.hasOwnProperty('openid') || !data.hasOwnProperty('access_token')) {
            throw new Error('no openid or  access_token in  data');
        }
        return data;
    },

    /**
     * 获取昵称和头像
     * @param  access_token
     * @param  openId
     * @returns {*}
     */
    getUserInfoByAccessTokenAndOpenId: function*(access_token, openId) {
        console.log('getUserInfoByAccessTokenAndOpenId method start');
        //https://api.weixin.qq.com/sns/userinfo?access_token=ACCESS_TOKEN&openid=OPENID&lang=zh_CN
        // 1 url 拼装
        let url = config.wechatGetUserInfoUrl + '?access_token=' + access_token + '&openid=' + openId + '&lang=zh_CN';
        console.log('url is ' + url);
        let headers = {'User-Agent': 'curl/7.19.7'};
        // 2 http request
        let body = yield request_get(url, headers, '请求用户信息错误', 3);
        // 3 return json
        let data = JSON.parse(body);
        if (!data.hasOwnProperty('nickname') || !data.hasOwnProperty('headimgurl')) {
            throw new Error('no nickname or  headimgurl in  data');
        }
        return data;
    }
};