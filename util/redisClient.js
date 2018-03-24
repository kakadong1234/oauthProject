/**
 * Created by zy8 on 2017/1/10.
 */
let redis = require('redis');
const config = require('../config')();
module.exports = {
    _client: null,
    getClient() {
        if (!this._client) {
            this._client = redis.createClient(
                config.REDIS_PORT,
                config.REDIS_HOST
            );
        }
        return this._client;
    },
    hgetall: function(key){
        return new Promise((resolve, reject) => {
            this.getClient().hgetall(key, (err, val) => {
                if (err) {
                    return reject(err);
                }
                return resolve(val);
            });
        });
    },

    hmset: function(key, data){
        return new Promise((resolve, reject) => {
            this.getClient().hmset(key, data, (err) => {
                if (err) {
                    return reject(err);
                }
                return resolve();
            });
        });
    },

    expire:function (key, expire) {
        return new Promise((resolve, reject) => {
            this.getClient().expire(key, expire, (err) => {
                if (err) {
                    return reject(err);
                }
                return resolve();
            });
        });
    },

    delete:function(key){
        return new Promise((resolve, reject) => {
            this.getClient().delete(key, (err) => {
                if (err) {
                    return reject(err);
                }
                return resolve();
            });
        });
    }

};