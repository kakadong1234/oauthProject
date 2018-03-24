/**
 * Created by zy8 on 2017/1/9.
 */
const config = require('../config')();
let {
    request_get
}= require('../util');
let urlModel = require('url');
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
        // qq
        let oauthInfo = {
            appId: config.QQCONFIG.appId,
            appSecret: config.QQCONFIG.appSecret
        };
        return oauthInfo;
    },


    /**
     * 获取发起Oauth的url(拼装url)
     * @param sessionCode 发起授权时传入的信息存储在redis中的key
     * @param oauthInfo appId等授权所需的信息
     * @param scope (可选，值为 basic ， user_info, 默认为user_info) （权限范围， user_info拿到用户信息后302， basic是拿到openid（uid）后直接302）
     * @returns {*}
     */
    getStartOauthUrl(sessionCode, oauthInfo, scope){
        console.log('getStartOauthUrl method start');
        // https://graph.qq.com/oauth2.0/authorize?client_id=appid&redirect_uri=REDIRECT_URI&display=mobile&response_type=code&state=test
        let redirect_uri = config.oauthBackUrl + '?sessionCode=' + sessionCode + '&oauthPlatformType=' + 'QQ';
        let display = 'mobile';
        let oauthBackUrl = config.qqAuthorizeUrl + '?client_id=' + oauthInfo.appId + '&redirect_uri=' + encodeURIComponent(redirect_uri) + '&display=' + display + '&response_type=code&&state=STATE';
        console.log('oauthBackUrl is ' + oauthBackUrl);
        return oauthBackUrl;
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
        let accessTokenInfo = yield this.getAccessToken(code, oauthInfo.appId, oauthInfo.appSecret, sessionCode);
        console.log(accessTokenInfo);
        let access_token = accessTokenInfo.access_token;
        let openIdInfo = yield this.getOpenid(access_token);
        console.log(openIdInfo);
        let openid = openIdInfo.openid;
        let userInfo = {
            openid: openid
        };
        if ('user_info' === scope) {
            // 3 获取用户信息
            let userInfoByRequest = yield this.getUserInfoByAccessTokenAndOpenId(access_token, openid, oauthInfo.appId);
            console.log(userInfoByRequest);
            userInfo.nickname = userInfoByRequest.nickname;
            userInfo.headimgurl = userInfoByRequest.figureurl_qq_1;
        }
        return userInfo;
    },

    /**
     * 获取accessToken
     * @param  code （授权平台请求过来的code，用于获取access_token）
     * @param appId
     * @param secret
     * @param sessionCode
     * @returns {*}
     */
    getAccessToken: function*(code, appId, secret, sessionCode) {
        console.log('getAccessToken method start');
        //https://graph.qq.com/oauth2.0/token?client_id=appid&client_secret=secret&redirect_uri=redirect_uri&code=code&grant_type=authorization_code
        let redirect_uri = config.oauthBackUrl + '?sessionCode=' + sessionCode + '&oauthPlatformType=' + 'QQ';
        // 1 url 拼装
        let url = config.qqGetAccessTokenUrl + '?client_id=' + appId + '&client_secret=' + secret + '&redirect_uri=' + encodeURIComponent(redirect_uri) + '&code=' + code + '&grant_type=authorization_code';
        console.log('url is ' + url);
        let headers = {'User-Agent': 'curl/7.19.7'};
        // 2 http request
        let body = yield request_get(url, headers, '请求access_token 错误', 3);
        // 3 return json -- is no a json
        let data = urlModel.parse('?' + body, true).query; //QQ的返回不是json字符串，而是"access_token=F497CB4DCBE0D4714293C4CD00E91E01&expires_in=7776000&refresh_token=7DAAE72EFBDF48B22689B597529B9F32这样的值
        console.log(data);
        if (data.access_token === undefined) {
            throw new Error('no access_token in  data');
        }
        return data;
    },

    /**
     * 获取openid
     * @param  access_token
     * @returns {*}
     */
    getOpenid: function*(access_token) {
        console.log('getOpenid method start');
        //https://graph.qq.com/oauth2.0/me?access_token=*****
        // 1 url 拼装
        let url = config.qqGetOpenIdUrl + '?access_token=' + access_token;
        console.log('url is ' + url);
        let headers = {'User-Agent': 'curl/7.19.7'};
        // 2 http request
        let body = yield request_get(url, headers, '请求openid 错误', 3);
        // 3 return json
        let data = JSON.parse(body.substring(body.indexOf('{'), body.indexOf('}') + 1)); //QQ的返回不是json字符串，而是callback( {\"client_id\":\"101379168\",\"openid\":\"3D506FE0BAD7A65C2E98867E8A866479\"} );\n这样的值
        if (data.openid === undefined) {
            throw new Error('no openid in  data');
        }
        return data;
    },

    /**
     * 获取昵称和头像
     * @param  access_token
     * @param  openId
     * @param  appid
     * @returns {*}
     */
    getUserInfoByAccessTokenAndOpenId: function*(access_token, openId, appid) {
        console.log('getUserInfoByAccessTokenAndOpenId method start');
        //https://graph.qq.com/user/get_user_info?access_token=*************&oauth_consumer_key=12345&openid=****************&format=json
        // 1 url 拼装
        let url = config.qqGetUserInfoUrl + '?access_token=' + access_token + '&openid=' + openId + '&oauth_consumer_key=' + appid + '&format=json';
        console.log('url is ' + url);
        let headers = {'User-Agent': 'curl/7.19.7'};
        // 2 http request
        let body = yield request_get(url, headers, '请求用户信息错误', 3);
        // 3 return json
        let data = JSON.parse(body); //json
        if (!data.hasOwnProperty('nickname') || !data.hasOwnProperty('figureurl_qq_1')) {
            throw new Error('no nickname or  figureurl_qq_1 in  data');
        }
        return data;
    }


};