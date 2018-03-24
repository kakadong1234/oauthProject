/**
 * Created by zy8 on 2017/1/5.
 */
const router = require('express').Router();
const {
    oauthController,
    jsSignatureController
} = require('./controller');
let validate = require('./midware').validate;

/**
 * 监控接口，zabbx监控（返回关键字success）
 * curl 'http://localhost:8809'
 */
router.get('/', jsSignatureController.getUniqueSource);

/**
 *  获取 jssdk 签名相关参数
 * @param url  (必选)(使用该接口的url)
 */
router.get('/getJsApiSignature', validate.getJsApiSignature, jsSignatureController.getJsApiSignature);

/**
 * 发起oauth2.0授权接口
 * 微信 curl 'http://localhost:8809/startOauth?cId=1&oauthPlatformType=WeChat&appName=yiLive&redirect_uri=http%3a%2f%2fwww.baidu.com'
 * QQ curl 'http://localhost:8809/startOauth?cId=1&oauthPlatformType=QQ&appName=yiLive&redirect_uri=http%3a%2f%2fwww.baidu.com'
 * sinaWeiBo curl 'http://localhost:8809/startOauth?cId=1&oauthPlatformType=SinaWeiBo&appName=yiLive&redirect_uri=http%3a%2f%2fwww.baidu.com'
 * @param appName  (必选)(使用该接口的app Name)
 * @param cId  (必选) (客户Id)
 * @param redirect_uri  (必选)(回调地址)
 * @param oauthPlatformType (必选)（授权平台类型， 值为WeChat, QQ, SinaWeiBo）
 * @param scope (可选，值为 basic ， user_info, 默认为user_info) （权限范围， user_info拿到用户信息后302， basic是拿到openid（uid）后直接302）
 * @return 302 到 社交平台发送oauth的url
 */
router.get('/startOauth', validate.checkStartOauthInterface, oauthController.startOauth);


//TODO:https
/**
 * oauth回调接口
 * 微信 curl 'http://localhost:8809/oauthCallBack?sessionCode=WeChat_65b05ad419e15734e6457067e33f6742&oauthPlatformType=WeChat&code=013JeSpj2TJHjH0mVCqj2WzVpj2JeSp9&state=STATE'
 * QQ  curl 'http://localhost:8809/oauthCallBack?sessionCode=QQ_8e734d7c4b26ff6fe925c26334fc9784&oauthPlatformType=QQ&code=587591006680B3B78367B2730E1718C5&state=STATE'
 * sinaWeibo  curl 'http://localhost:8809/oauthCallBack?sessionCode=SinaWeiBo_b9f2a6d21224f32ee81adaa1c3ae5b8f&oauthPlatformType=SinaWeiBo&state=STATE&code=2c72c43ab36df0e8b8d10e04322ededb'
 * @param sessionCode 发起授权时传入的信息存储在redis中的key
 * @param code （授权平台请求过来的code，用于获取access_token)
 * @param oauthPlatformType （授权平台类型， 值为WeChat, QQ, SinaWeiBo）
 * @return 302 到 redirect_uri?openid=12dd11d&nickname=nickName123&headImgUrl=http://img2.imgtn.bdimg.com/it/u=3982832758,507835316&fm=23&gp=0.jpg
 */
router.get('/oauthCallBack', validate.checkOauthCallBackInterface, oauthController.oauthCallBack);

module.exports = router;

