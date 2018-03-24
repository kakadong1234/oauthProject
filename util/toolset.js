'use strict';

let crypto = require('crypto');
let _ = require('underscore');
let uuid = require('node-uuid');
let request = require('request');

const HTTP_REQUEST_REPONSE_BACK_TIMEOUT = 30000; //http请求超时时间
module.exports = {

    /**
     * 得到nonceStr
     * @returns {*}
     */
    sha1Encrypt(key){
        const sha1 = crypto.createHash('sha1');
        return sha1.update(key).digest('hex');
    },

    /**
     * 得到nonceStr
     * @returns {*}
     */
    getNoncestr(){
        return Math.random().toString(36).substr(2, 15);
    },
    /**
     * md5 hash
     * @param target 原始字符串
     * @returns {*}
     */
    hash(target) {
        let md5 = crypto.createHash('md5');
        md5.update(target);
        return md5.digest('hex');
    },

    /**
     * hmac sign
     * @param target 原始字符串
     * @param key    加密密钥
     * @returns {string|String|*}
     */
    sign(target, key) {
        let hmac = crypto.createHmac('sha1', key);
        return hmac.update(target).digest().toString('base64');
    },

    /**
     * 判断字符串是否在字符串数组中
     * @param target 原始字符串
     * @param array 数组
     * @returns Boolean
     */
    isInArray(target, array) {
        let flag = false;
        array.forEach(function (obj) {
            if (target === obj) {
                flag = true;
            }
        });
        return flag;
    },

    /**
     * 生成唯一id（uuid）
     * @returns string
     */
    createUUID() {
        return uuid.v4();
    },


    /**
     * Get 请求方法
     * @param url request url
     * @param headers  request headers
     * @param outPutErrMsg http 请求错误时对于的错误返回
     * @param retryCount http重试次数
     * @returns string
     */
    fetchPlayDataFromWebByGET(url, headers, outPutErrMsg, retryCount) { //TODO:
        // if (retryCount === 0) {
        //     return reject(new Error(outPutErrMsg));
        // }
        // body = yield this.fetchPlayDataFromWebByGET(url, headers, outPutErrMsg, retryCount - 1);
        return new Promise((resolve, reject) => {
            let startTime = Date.now();
            request.get({
                url: url,
                headers: headers,
                timeout: HTTP_REQUEST_REPONSE_BACK_TIMEOUT
            }, function (error, response, body) {
                let costTime = Date.now() - startTime;
                console.log('------ request for url:' + url + ' ****** cost:  ' + costTime + 'ms');
                console.log('response is ' + response);
                if (error || response.statusCode != 200) {
                    return reject(new Error(outPutErrMsg));
                }
                return resolve(body);
            });
        });
    },


    /**
     * Post 请求方法
     * @param url request url
     * @param headers  request headers
     *  @param data post的数据
     * @param outPutErrMsg http 请求错误时对于的错误返回
     * @param retryCount http重试次数
     * @returns string
     */
    fetchPlayDataFromWebByPost(url, headers, data, outPutErrMsg, retryCount) {
        return new Promise((resolve, reject) => {
            let startTime = Date.now();
            request.post({
                url: url,
                headers: headers,
                form: data,
                timeout: HTTP_REQUEST_REPONSE_BACK_TIMEOUT
            }, function (error, response, body) {
                let costTime = Date.now() - startTime;
                console.log('------ request for url:' + url + ' ****** cost: ' + costTime + 'ms');
                console.log('response is ' + response);
                if (error || response.statusCode != 200) {
                    return reject(new Error(outPutErrMsg));
                }
                else {
                    return resolve(body);
                }
            })
        });
    }
};