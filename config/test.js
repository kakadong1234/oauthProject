/**
 * Created by zy8 on 2017/1/5.
 */
module.exports = {
    DEBUG: true,
    //微信公众号appId和secret
    WECHATCONFIG: {
        appId: 'wx42c541c8dc3abf18',
        appSecret: '387a1c0be90221c90e267238fd005320'
    },
    // WECHATCONFIG: {
    //     appId: 'wx1a32f8e092befa21',
    //     appSecret: 'f5d305056329484c110f8862b0f13617'
    // },

    //qq的appId和secret
    QQCONFIG: {
        appId: '101379168',
        appSecret: '669315dc728ee8b2b11333d47620fd32'
    },

    //sina微博的appId和secret
    // SINAWEIBOCONFIG: {
    //     appId: '3166756992',
    //     appSecret: '79a471602fdd60a2c49deb4d1af95ca9'
    // },
    SINAWEIBOCONFIG: {
        appId: '1046092088',
        appSecret: 'cf5c95d8f14d43f737bfb67e23780eb4'
    },


    REDIS_PORT: 6379,
    REDIS_HOST: 'localhost',

    oauthBackUrl: 'http://testoauthandshare.wooos.cn:' + 8909 + '/oauthCallBack',

    //分享信息 - 默认linkUrl
    // linkUrl: 'http://10.0.60.95:8909/startOauth'//TODO:详情页地址，由前端给出
    linkUrl: 'http://10.0.60.95:8090/mqtth5'
};
