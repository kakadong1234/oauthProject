let validate = require('../util').validhelper;

module.exports = {
    /**
     * 通用请求参数验证中间件(针对公用参数的验证)
     */
    common(req, res, next) {
        //不用校验参数的路径或文件  -- 只有鉴权相关的接口不在header中带ts和token
        if (req.url == '/' || req.url.indexOf('/startOauth') != -1 || req.url.indexOf('/oauthCallBack') != -1 || /\.log|\.ico/.test(req.url)) {
            return next();
        }

        validate.assertEmptyFromHeader(req, ['token', 'ts']);
        handleValidationResult(req, next); // get assert result
    },


    /**
     * 获取分享到各种社交平台所需要的信息接口验证中间件: checkShareInfoInterface
     */
    checkShareInfoInterface(req, res, next) {
        let fields = ['appName', 'sharePlatformType', 'cId'];
        validate.assertEmpty(req, fields);

        validate.assertSharePlatformType(req);
        validate.assertAppNameType(req);
        validate.assertCId(req);
        handleValidationResult(req, next);
    },


    /**
     * 设置分享涉及的defaultShareImgUrl和linkUrl等信息接口验证中间件: checkDefaultShareInfoInterface
     */
    checkDefaultShareInfoInterface(req, res, next) {
        let fields = ['sharePlatformType', 'defaultShareImgUrl', 'linkUrl', 'cId', 'appName'];

        validate.assertEmpty(req, fields);
        validate.assertSharePlatformType(req);
        validate.assertAppNameType(req);
        validate.assertCId(req);
        handleValidationResult(req, next);
    },

    /**
     *  发起oauth2.0授权接口验证中间件: checkStartOauthInterface
     */
    checkStartOauthInterface(req, res, next) {
        let fields = ['appName', 'cId', 'redirect_uri', 'oauthPlatformType'];

        validate.assertEmpty(req, fields);
        validate.assertOauthPlatformType(req);
        validate.assertAppNameType(req);
        validate.assertCId(req);
        handleValidationResult(req, next);
    },

    /**
     *  oauth回调接口验证中间件: checkOauthCallBackInterface
     */
    checkOauthCallBackInterface(req, res, next) {
        let fields = ['sessionCode', 'code', 'oauthPlatformType'];

        validate.assertEmpty(req, fields);
        validate.assertOauthPlatformType(req);
        handleValidationResult(req, next);
    },

    getJsApiSignature(req, res, next) {
        let fields = ['url'];
        validate.assertEmpty(req, fields);
        handleValidationResult(req, next);
    },

    // /**
    //  * 接口单独验证中间件: sendMessage
    //  */
    // sendMessage(req, res, next) {
    //     let field = 'message';
    //
    //     validate.assertEmpty(req, [field]);
    //     //校验消息中必须要有type字段
    //     if (req.body[field] && req.isFromLEJU) {
    //         validate.assertMessage(req, field);
    //     }
    //
    //     handleValidationResult(req, next);
    // },
};

function handleValidationResult(req, next) {
    req.getValidationResult().then(result => {
        if (!result.isEmpty()) {
            return next(new Error(
                //仅返回第一个错误
                result.array()[0].msg

                // //验证结果数组中的错误消息用分号拼接
                // result.array().map(item => item.msg).join(';')
            ));
        }
        next();
    });
}