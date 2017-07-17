var Memcached = require('memcached');
var util = require('util');

module.exports = function () {
    var client = new Memcached('localhost:11211', {
        maxKeySize: 2500,
        poolSize: 20,
        timeout: 1000,
        reconnect: 5000,
        retries: 2,
        idle: 10000
    });
    
    client.get = util.promisify(client.get);
    client.set = util.promisify(client.set);

    return {
        get: function (key) {
            if (key) {
                return client.get(key);
            }
            return Promise.resolve();
        },
        set: function (key, value, lifetime) {
            lifetime = lifetime || 86400;

            if (key) {
                return client.set(key, value, lifetime);
            }
            return Promise.resolve();
        }
    }
}
