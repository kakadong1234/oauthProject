/**
 * Created by zy8 on 2017/1/5.
 */
module.exports = {
    ALL_ENVS: ['dev', 'test', 'pro'],

    DEFAULT_NODE_ENV: 'pro', //默认是生产环境
    PORT: 8809,
    oauthTypeList: [
        'WeChat', 'QQ', 'SinaWeiBo'
    ],

    weChatOauthType: 'WeChat',
    qqOauthType: 'QQ',
    sinaWeiBoOauthType: 'SinaWeiBo',

    shareTypeList: [
        'WeChatFriend', 'WeChatMoments', 'QQFirend', 'QQSpace', 'SinaWeiBo'
    ],

    startOauthKeyPre: 'startOauthKey_',
    shareInfoPre: 'shareInfo_',
    accessTokenRedisKey: 'accessToken',
    jsApiTicketRedisKey: 'jsApiTicket',
    uniqueSourceAccessTokenRedisKey: 'uniqueSource_accessToken',
    uniqueSourceJsApiTicketRedisKey: 'uniqueSource_jsApiTicket',
    wechatUniqueSourceStartedRedisKey: 'wechatUniqueSourceStarted',
    //start oauth url
    // authorize Url
    sinaWeiBoAuthorizeUrl: 'https://api.weibo.com/oauth2/authorize',
    qqAuthorizeUrl: 'https://graph.qq.com/oauth2.0/authorize',
    wechatAuthorizeUrl: 'https://open.weixin.qq.com/connect/oauth2/authorize',

    // get access_token url
    sinaWeiBoGetAccessTokenUrl: 'https://api.weibo.com/oauth2/access_token',
    qqGetAccessTokenUrl: 'https://graph.qq.com/oauth2.0/token',
    wechatGetAccessTokenUrl: 'https://api.weixin.qq.com/sns/oauth2/access_token',

    // get opneid Url
    sinaWeiBoGetOpenIdUrl: 'https://api.weibo.com/oauth2/get_token_info',
    qqGetOpenIdUrl: 'https://graph.qq.com/oauth2.0/me',

    // get userInfo url
    sinaWeiBoGetUserInfoUrl: 'https://api.weibo.com/2/users/show.json',
    qqGetUserInfoUrl: 'https://graph.qq.com/user/get_user_info',
    wechatGetUserInfoUrl: 'https://api.weixin.qq.com/sns/userinfo',



    wechatGetApiAccessTokenUrl: 'https://api.weixin.qq.com/cgi-bin/token',
    wechatGetJsApiTicketUrl: 'https://api.weixin.qq.com/cgi-bin/ticket/getticket',
    // qqAuthorizeUrl:'https://graph.z.qq.com/moc2/authorize',
    // qqGetAccessTokenUrl:'https://graph.z.qq.com/moc2/token ',
    // qqGetOpenIdUrl:'https://graph.z.qq.com/moc2/me',

    //分享信息 - 默认图片地址
    defaultShareImgUrl: 'https://ss0.bdstatic.com/70cFuHSh_Q1YnxGkpoWK1HF6hhy/it/u=3671187529,818443861&fm=23&gp=0.jpg', //TODO: 上传易-LIve图片，并获取url，填入

    TOKEN: {
        LEJU: 'dbc1f236b6ec76503209c48efd56da8f',
    },

    LOG_PATH: `${__dirname}/../log`,

    tsInterval: (60 * 60 * 1000)

};