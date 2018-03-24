/**
 * Created by zy8 on 2017/5/9.
 */
//accessToken , jsApiTicket等唯一性资源生成脚本
const co = require('co');
const config = require('./config')();
const {
    ticketService
} = require('./service');

var main = function () {
    co(function *() {
        //TODO: 要有清楚站位ip的入口
        const ipData = yield getWechatUniqueSourceStarted(); //唯一性资源,只能有一台机器启动,防止多台机器启动 -- store ip
        const machineIp = getClientIP();
        console.log(' -- machine ip is ' + machineIp);
        if(!ipData){
            console.log('-- start');
            yield generateWechateUniqueSource(machineIp);
        }
        else {
            console.log('-- restart');
            if (ipData.ip === machineIp) { //没有存储ip(第一次启动)，获取ip === 本机ip(相同机器重启)
                yield generateWechateUniqueSource(machineIp);
            }
            else {
                console.log(' -- can not start wechatUniqueSource: ip in db is ' + ipData.ip + ', machine ip is ' + machineIp);
            }
        }
    }).catch(error);
    function error(err) {
        console.log(err.message);
    }
};

var generateWechateUniqueSource = function *(machineIp) {
    console.log(' -- start wechatUniqueSource ');
    yield generateAccessToken();
    yield generateJsApiTicket();
    yield setWechatUniqueSourceStarted(machineIp);
    console.log(' -- start wechatUniqueSource success ');
};

var generateAccessToken = function *() {
    // 1 get AccessToken from wechat
    const accessTokenData = yield ticketService.getAccessTokenFromWechat(config.WECHATCONFIG.appId, config.WECHATCONFIG.appSecret);
    accessTokenData.updateTimeStamp = parseInt(Date.now() / 1000);
    console.log(accessTokenData);
    const expires_in = (accessTokenData.expires_in ? accessTokenData.expires_in : 7200) / 2;
    const timeout_expires_in = expires_in * 1000;
    // 2 set accessToken
    yield ticketService.setAccessTokenToDB(config.accessTokenRedisKey, accessTokenData);
    yield ticketService.setUniqueSourceToDB(config.uniqueSourceAccessTokenRedisKey, expires_in + 60, accessTokenData);
    // 3 set Timeout for accessToken
    setTimeout(function () {
        co(function *() {
            yield generateAccessToken();
        }).catch(error);
        function error(err) {
            console.log(err.message);
            //TODO:写入到错误队列
        }
    }, timeout_expires_in);
};

var generateJsApiTicket = function *() {
    // 1 get accessToken
    const accessTokenData = yield ticketService.getAccessTokenFromDB(config.accessTokenRedisKey);
    // 2 get jsApiTicket from wechat
    const jsApiTicketData = yield ticketService.getJsApiTicketFromWechat(accessTokenData.access_token);
    jsApiTicketData.updateTimeStamp = parseInt(Date.now() / 1000);
    console.log(jsApiTicketData);
    const expires_in = (jsApiTicketData.expires_in ? jsApiTicketData.expires_in : 7200) / 2;
    const timeout_expires_in = expires_in * 1000;
    // 3 set jsApiTicket
    yield ticketService.setJsApiTicketToDB(config.jsApiTicketRedisKey, jsApiTicketData);
    yield ticketService.setUniqueSourceToDB(config.uniqueSourceJsApiTicketRedisKey, expires_in + 60, jsApiTicketData);
    // 4 set Timeout for jsApiTicket
    setTimeout(function () {
        co(function *() {
            yield generateJsApiTicket();
        }).catch(error);
        function error(err) {
            console.log(err.message);
            //TODO:写入到错误队列
        }
    }, timeout_expires_in);
};

var getWechatUniqueSourceStarted = function *() {
    return yield ticketService.getWechatUniqueSourceStartedFromDB(config.wechatUniqueSourceStartedRedisKey);
};

var setWechatUniqueSourceStarted = function *(machineIp) {
    yield ticketService.setWechatUniqueSourceStartedToDB(config.wechatUniqueSourceStartedRedisKey, {ip: machineIp});
};

var getClientIP = function () {
    var interfaces = require('os').networkInterfaces();
    for (var devName in interfaces) {
        var iface = interfaces[devName];
        for (var i = 0; i < iface.length; i++) {
            var alias = iface[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                return alias.address;
            }
        }
    }
};
main();