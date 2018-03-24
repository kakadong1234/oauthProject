/**
 * Created by zy8 on 2017/1/5.
 */

'use strict';

let express = require('express');
let bodyParser = require('body-parser');
let expressValidator = require('express-validator');
let router = require('./router');
let {
    cors,
    validate,
    httplog,
    auth,
    prop,
} = require('./midware');
const config = require('./config')();
let {
    customValidators
} = require('./util');

let app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(expressValidator({customValidators}));
app.use(express.static('./log'));
app.use(express.static('public')); //public 中加入微信oauth认证需要的txt静态文件

app.use(httplog); // http log 添加
app.use(cors); // http header set (如Access-Control-Allow-Origin) //TODO
app.use(validate.common); //参数验证
app.use(auth);  //ts, token 鉴权验证
app.use(prop);  // 设置一些request级别的变量,方便后续使用
app.use(router);

// app.use((req, res, next) => {
//     let err = new Error('请求的API接口或文件不存在');
//     next(err);
// });

app.use(({code = -1, message}, req, res, next) => {

    res.json({code, msg: message});
});

app.listen(config.PORT);