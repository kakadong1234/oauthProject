const config = require('../config')();
module.exports = {
    /**
     * 校验参数是否为空
     * @param req       request对象
     * @param fields    待校验参数列表
     */
    assertEmpty(req, fields) {
        let assertMethod = req.method == 'GET' ? req.checkQuery : req.checkBody;
        fields.forEach(field => {
            assertMethod(field, `请求参数${field}不能为空`).notEmpty();
        });
    },

    /**
     * 校验header中的字段是否为空
     * @param req       request对象
     * @param fields    待校验参数列表
     */
    assertEmptyFromHeader(req, fields) {
        fields.forEach(field => {
            req.checkHeaders(field, '身份验证失败').notEmpty();
        });
    },

    /**
     * 校验消息内容格式
     * @param req   request对象
     * @param field 待校验参数
     */
    assertMessage(req, field) {
        req.checkBody(field, `请求参数${field}的值${req.body[field]}不符合消息格式`).isMessage();
        req.checkBody(field, `请求参数${field}中的消息内容msg不能为空`).msgNotEmpty();
    },

    /**
     * 校验OauthPlatformType
     * @param req   request对象
     */
    assertOauthPlatformType(req) {
        let field = 'oauthPlatformType';
        let assertMethod = req.method == 'GET' ? req.checkQuery : req.checkBody;
        assertMethod(field, `请求参数${field}不在运行的范围内`).isInArray(config.oauthTypeList);
    },

    /**
     * 校验SharePlatformType
     * @param req   request对象
     */
    assertSharePlatformType(req) {
        let field = 'sharePlatformType';
        let assertMethod = req.method == 'GET' ? req.checkQuery : req.checkBody;
        assertMethod(field, `请求参数${field}不在运行的范围内`).isInArray(config.shareTypeList);
    },
    /**
     * 校验AppNameType
     * @param req   request对象
     */
    assertAppNameType(req){
        return true;
    },
    /**
     * 校验cId
     * @param req   request对象
     */
    assertCId(req){
        return true;
    }
};