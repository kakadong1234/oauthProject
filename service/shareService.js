/**
 * Created by zy8 on 2017/1/13.
 */
const config = require('../config')();
const {
    redis
}= require('../util');

module.exports = {

    /**
     * 根据sharePlatformType, appName 和 cId获取默认图片和linkUrl
     * @param  sharePlatformType（分享平台类型， 值为WeChatFriend, WeChatMoments, QQFirend, QQSpace, SinaWeiBo）
     * @param appName (使用该接口的app Name)
     * @param cId (客户Id)
     * @returns {*}
     */
    getShareInfo: function*(sharePlatformType, appName, cId) {
        console.log('getShareInfo method start');
        let shareKey = this.getShareKey(sharePlatformType, appName);
        console.log('shareKey is ' + shareKey);
        let shareInfo = yield this.getShareInfoByKey(shareKey);
        if (shareInfo === undefined || shareInfo === null) {
            shareInfo = {};
        }
        if (!shareInfo.hasOwnProperty('linkUrl')) {
            shareInfo.linkUrl = config.linkUrl;
        }
        if (!shareInfo.hasOwnProperty('defaultShareImgUrl')) {
            shareInfo.defaultShareImgUrl = config.defaultShareImgUrl;
        }
        return shareInfo;
    },


    /**
     * 设置默认图片和linkUrl
     * @param  sharePlatformType（分享平台类型， 值为WeChatFriend, WeChatMoments, QQFirend, QQSpace, SinaWeiBo）
     * @param appName (使用该接口的app Name)
     * @param cId (客户Id)
     * @param defaultShareImgUrl (默认图片url)
     * @param linkUrl (链接地址)
     * @returns boolean
     */
    setShareInfo: function*(sharePlatformType, appName, cId, defaultShareImgUrl, linkUrl) {
        console.log('setShareInfo method start');
        let shareKey = this.getShareKey(sharePlatformType, appName);
        console.log('shareKey is ' + shareKey);
        let value = {
            defaultShareImgUrl: defaultShareImgUrl,
            linkUrl: linkUrl
        };
        yield this.setShareInfoByKey(shareKey, value);
        return true;
    },

    /**
     * 根据sharePlatformType（分享类型）获取对应的oauthPlatformType（oauth类型）
     * @param  sharePlatformType（分享平台类型， 值为WeChatFriend, WeChatMoments, QQFirend, QQSpace, SinaWeiBo）
     * @returns {*}
     */
    getOauthPlatformTypeBySharePlatformType(sharePlatformType){
        console.log('getOauthPlatformTypeBySharePlatformType method start');
        if (sharePlatformType.indexOf(config.weChatOauthType) === 0) {
            return config.weChatOauthType;
        }
        else if (sharePlatformType.indexOf(config.qqOauthType) === 0) {
            return config.qqOauthType;
        }
        else if (sharePlatformType.indexOf(config.sinaWeiBoOauthType) === 0) {
            return config.sinaWeiBoOauthType;
        }
        else {
            throw new Error('input sharePlatformType:' + sharePlatformType + 'no allow');
        }
    },

    /**
     * 将oauthPlatformType和linkUrlParams里的参数拼接 到linkUrl
     * @param oauthPlatformType （授权平台类型， 值为WeChat, QQ, SinaWeiBo）
     * @param  linkUrlParams （要拼接的参数）
     * @param  oldLinkUrl （redis中获取的链接）
     * @returns {*}
     */
    getReturnLinkUrl(oauthPlatformType, linkUrlParams, oldLinkUrl){
        console.log('getReturnLinkUrl method start');
        let linkUrl = oldLinkUrl.indexOf('?') === -1 ? oldLinkUrl + '?oauthPlatformType=' + oauthPlatformType : oldLinkUrl + '&oauthPlatformType=' + oauthPlatformType;
        if (undefined === linkUrlParams) {
            return linkUrl;
        }
        let linkKeys = Object.keys(linkUrlParams);
        linkKeys.forEach(function (key) {
            linkUrl = linkUrl + '&' + key + '=' + encodeURIComponent(linkUrlParams[key]);
        });
        return linkUrl;
    },

    /**
     * 获取分享信息在redis中的key
     * @param  sharePlatformType（分享平台类型， 值为WeChatFriend, WeChatMoments, QQFirend, QQSpace, SinaWeiBo）
     * @param appName (使用该接口的app Name)
     * @returns string
     */
    getShareKey(sharePlatformType, appName) {
        return config.shareInfoPre + appName + ':';
    },

    /**
     * 从redis中获取分享信息
     * @param key (redis中的key)
     * @returns {*}
     */
    getShareInfoByKey: function*(key) {
        console.log('getShareInfoByKey method start');
        return yield redis.hgetall(key);
    },

    /**
     * 设置分享信息到redis中
     * @param key (redis中的key)
     * @param value (分享信息)
     * @returns {*}
     */
    setShareInfoByKey: function*(key, value) {
        console.log('setShareInfoByKey method start');
        return yield redis.hmset(key, value);
        // return new Promise((resolve, reject) => {
        //     redis.hmset(key, value, (err) => {
        //         if (err) {
        //             return reject(err);
        //         }
        //         return resolve();
        //     });
        // });
    }
};