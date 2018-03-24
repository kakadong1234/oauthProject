/**
 * Created by zy8 on 2017/1/5.
 */
module.exports = {
    DEBUG: false,
    //微信公众号appId和secret
    WECHATCONFIG: {
        appId: 'wx1a32f8e092befa21',
        appSecret: 'f5d305056329484c110f8862b0f13617'
    },
    //qq的appId和secret
    QQCONFIG: {
        appId: '',
        appSecret: ''
    },

    //sina微博的appId和secret
    SINAWEIBOCONFIG: {
        appId: '1046092088',
        appSecret: 'cf5c95d8f14d43f737bfb67e23780eb4'
    },

    REDIS_PORT: 6381,
    REDIS_HOST: '10.106.18.1',

    domain: 'http://oauthandshare.51Livetech.com', //端口映射
    oauthBackUrl: 'https://oauth-live.ejudata.com' + '/oauthCallBack',//TODO:

    //分享信息 - 默认linkUrl
    linkUrl: ''//TODO:详情页地址，由前端给出
};
