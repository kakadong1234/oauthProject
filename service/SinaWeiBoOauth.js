/**
 * Created by zy8 on 2017/1/9.
 */
const config = require('../config')();
const {
    request_get,
    request_post
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
        // sina微博
        let oauthInfo = {
            appId: config.SINAWEIBOCONFIG.appId,
            appSecret: config.SINAWEIBOCONFIG.appSecret
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
        //https://api.weibo.com/oauth2/authorize?client_id=123050457758183&redirect_uri=http://www.example.com/response&scope=scope&display=display&state=STATE

        let redirect_uri = config.oauthBackUrl + '?sessionCode=' + sessionCode + '&oauthPlatformType=' + 'SinaWeiBo';
        let display = 'default';
        let oauthBackUrl = config.sinaWeiBoAuthorizeUrl + '?client_id=' + oauthInfo.appId + '&redirect_uri=' + encodeURIComponent(redirect_uri) + '&display=' + display + '&state=STATE';
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
        let openid = openIdInfo.uid;
        let userInfo = {
            openid: openid
        };
        if ('user_info' === scope) {
            // 3 获取用户信息
            let userInfoByRequest = yield this.getUserInfoByAccessTokenAndOpenId(access_token, openid, oauthInfo.appId);
            console.log(userInfoByRequest);
            userInfo.nickname = userInfoByRequest.screen_name;
            userInfo.headimgurl = userInfoByRequest.profile_image_url;
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
        //https://api.weibo.com/oauth2/access_token?client_id=appid&client_secret=secret&redirect_uri=redirect_uri&code=code&grant_type=authorization_code
        let redirect_uri = config.oauthBackUrl + '?sessionCode=' + sessionCode + '&oauthPlatformType=' + 'SinaWeiBo';
        // 1 url 拼装
        // let url = config.sinaWeiBoGetAccessTokenUrl + '?client_id=' + appId + '&client_secret=' + secret  + '&redirect_uri=' + encodeURIComponent(redirect_uri) + '&code=' + code + '&grant_type=authorization_code';
        let url = config.sinaWeiBoGetAccessTokenUrl;
        let reqData = {
            client_id: appId,
            client_secret: secret,
            redirect_uri: redirect_uri,
            code: code,
            grant_type: 'authorization_code'
        };
        console.log('url is ' + url);
        let headers = {'User-Agent': 'curl/7.19.7'};
        // 2 http request
        let body = yield request_post(url, headers, reqData, '请求access_token 错误', 3);
        // 3 return json
        let data = JSON.parse(body);
        if (!data.hasOwnProperty('access_token')) {
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
        //https://api.weibo.com/oauth2/get_token_info?access_token=*****
        // 1 url 拼装
        // let url = config.sinaWeiBoGetOpenIdUrl + '?access_token=' + access_token;
        let url = config.sinaWeiBoGetOpenIdUrl;
        let reqData = {
            access_token: access_token
        };
        console.log('url is ' + url);
        let headers = {'User-Agent': 'curl/7.19.7'};
        // 2 http request
        let body = yield request_post(url, headers, reqData, '请求openid 错误', 3);
        // 3 return json
        let data = JSON.parse(body);
        if (!data.hasOwnProperty('uid')) {
            throw new Error('no uid(openid) in  data');
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
        //https://api.weibo.com/2/users/show.json?access_token=XXX&uid=123
        // 1 url 拼装
        let url = config.sinaWeiBoGetUserInfoUrl + '?uid=' + openId + '&access_token=' + access_token;
        console.log('url is ' + url);
        let headers = {'User-Agent': 'curl/7.19.7'};
        // 2 http request
        let body = yield request_get(url, headers, '请求用户信息错误', 3);
        // 3 return json
        let data = JSON.parse(body);
        if (!data.hasOwnProperty('screen_name') || !data.hasOwnProperty('profile_image_url')) {
            throw new Error('no screen_name(nickname) or  profile_image_url in  data');
        }
        return data;
    }

};