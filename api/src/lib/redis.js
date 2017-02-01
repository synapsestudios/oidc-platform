const config = require('../../config');
const redis = require('redis');
const redisConfig = config('/redis');

module.exports = function() {
  return redis.createClient(redisConfig);
};

module.exports['@singleton'] = true;
module.exports['@require'] = [];
