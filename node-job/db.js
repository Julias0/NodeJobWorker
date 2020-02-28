let redis = require('redis');
let client = redis.createClient();

client.on('connect', function () {
    console.log('Connected!');
});

module.exports = client;