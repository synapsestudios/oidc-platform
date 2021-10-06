const IoRedis = require('ioredis');
const redisConfig = require('../../config')('/redis');

module.exports = function () {
  const redis = new IoRedis(redisConfig, {
    keyPrefix: 'oidc-api:',
  });

  return redis;
};
