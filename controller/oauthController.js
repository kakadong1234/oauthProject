/**
 * Created by zy8 on 2017/1/9.
 */
const co = require('co');
const {logger} = require('../util');
const {
    oauthProxy,
    shareService
} = require('../service');
module.exports = {

    oauthCallBack: (req, res, next) => {
        let sessionCode = req.query.sessionCode;
        let code = req.query.code;
        let oauthPlatformType = req.query.oauthPlatformType;
        co(function *() {
            // 1 根据sessionCode获取 发起oauth授权时存储的数据
            let startOauthInfo = yield oauthProxy.getStartOauthInfo(sessionCode);
            logger.info(startOauthInfo);
            // 2 根据code和startOauthInfo，获取用户信息（openId， 用户昵称，头像url）
            let userInfo = yield oauthProxy.getUserInfo(oauthPlatformType, code, startOauthInfo, sessionCode);
            logger.info(userInfo);
            // 3 组装backUrl
            let redirect_uri = startOauthInfo.redirect_uri;
            let scope = startOauthInfo.scope;
            let backUrl = oauthProxy.getBackUrl(redirect_uri, scope, userInfo, oauthPlatformType);
            logger.info('backUrl is ' + backUrl);
            // 4 302 到backUrl
            res.redirect(302, backUrl);
        }).catch(error);
        function error(err) {
            logger.info(err.message);
            next(err);
        }
    },

    startOauth: (req, res, next) => {
        let oauthPlatformType = req.query.oauthPlatformType;
        let appName = req.query.appName;
        let cId = req.query.cId;
        let redirect_uri = req.query.redirect_uri;
        let scope = req.query.scope ? req.query.scope : 'user_info';
        logger.info(scope);
        co(function *() {
            // 1 获取 oauth info（appId 和 secret）
            let oauthInfo = yield oauthProxy.getOauthInfo(oauthPlatformType, appName, cId);
            logger.info(oauthInfo);
            // 2 发起oauth
            req.query.scope = scope;
            let startOauthUrl = yield oauthProxy.startOauth(oauthPlatformType, scope, req.query, oauthInfo);
            logger.info('startOauthUrl is ' + startOauthUrl);
            // 4 302 到startOauthUrl
            res.redirect(302, startOauthUrl);
        }).catch(error);
        function error(err) {
            logger.info(err.message);
            next(err);
        }
    },


    getShareInfoForYiLIve: (req, res, next) => { //TODO:post???
        let sharePlatformType = req.body.sharePlatformType;
        let title = req.body.title ? req.body.title : '';
        let des = req.body.des ? req.body.des : '';
        let imgUrl = req.body.imgUrl ? req.body.imgUrl : ''; //默认分享图片url后续可以改成可配置的
        let linkUrlParams = req.body.linkUrlParams;
        let cId = req.body.cId;
        let appName = req.body.appName;
        co(function *() {
            //  1 根据sharePlatformType, appName 和 cId获取默认图片和linkUrl
            let shareInfo = yield shareService.getShareInfo(sharePlatformType, appName, cId);
            logger.info(shareInfo);
            //  2 根据sharePlatformType（分享类型）获取对应的oauthPlatformType（oauth类型）
            let oauthPlatformType = shareService.getOauthPlatformTypeBySharePlatformType(sharePlatformType);
            logger.info(oauthPlatformType);
            //  3 将oauthPlatformType和linkUrlParams里的参数拼接 到linkUrl
            let oldLinkUrl = shareInfo.linkUrl;
            let returnLinkUrl = shareService.getReturnLinkUrl(oauthPlatformType, linkUrlParams, oldLinkUrl);
            logger.info(returnLinkUrl);
            // 4 获取分享图片url
            let returnImgUrl = imgUrl === '' ? shareInfo.defaultShareImgUrl : imgUrl;
            logger.info(returnImgUrl);
            res.json({
                code: 1,
                msg: 'success',
                data: {
                    title: title,
                    des: des,
                    imgUrl: returnImgUrl,
                    linkUrl: returnLinkUrl
                }
            });
        }).catch(error);
        function error(err) {
            logger.info(err.message);
            next(err);
        }
    },

    setDefaultShareInfoForYiLive: (req, res, next) => {
        let sharePlatformType = req.body.sharePlatformType;
        let defaultShareImgUrl = req.body.defaultShareImgUrl; //默认分享图片url
        let linkUrl = req.body.linkUrl; //链接地址
        let cId = req.body.cId;
        let appName = req.body.appName;
        co(function *() {
            // 设置默认图片和linkUrl
            yield shareService.setShareInfo(sharePlatformType, appName, cId, defaultShareImgUrl, linkUrl);
            res.json({
                code: 1,
                msg: 'success',
                data: {
                    defaultImgUrl: defaultShareImgUrl,
                    linkUrl: linkUrl
                }
            });
        }).catch(error);
        function error(err) {
            logger.info(err.message);
            next(err);
        }
    }
};
