const Wreck = require('wreck');
const Hoek = require('hoek');
const IoRedis = require('ioredis');
const {
  JWS: { createSign },
  JWK: { asKeyStore },
} = require('node-jose');

const adapters = require('./queue-adapters');
const webhookConfig = require('../../../config')('/webhooks');
const fetchKeystore = require('../../lib/fetch-keystore');
const logger = require('../../lib/logger');
const redisConfig = require('../../../config')('/redis');
const validateData = require('./validateData');
const report = require('./report');

const redis = new IoRedis(redisConfig, {
  keyPrefix: 'oidc-api:',
});

// initialize the keystore
let keystore;
fetchKeystore()
  .then(asKeyStore)
  .then(k => {
    keystore = k;
  })
  .catch(e => {
    // keystore can't be initialized. something is wrong
    logger.error(e);
  });

const getToken = async data => {
  const redisKey = `webhook_token:${data.client_id}`;
  let token = await redis.get(redisKey);

  if (!token) {
    const timestamp = new Date().getTime()/1000|0;
    const tokenPayload = {
      iat: timestamp,
      exp: timestamp + 60 * 10,
      aud: data.client_id,
      iss: process.env.OIDC_BASE_URL || 'http://localhost:9000',
    };

    token = await createSign({
      fields: { typ: 'JWT' },
      format: 'compact',
    }, keystore.get({ alg: data.alg }))
      .update(JSON.stringify(tokenPayload), 'utf8')
      .final();

    await redis.set(redisKey, token, 'EX', timestamp + 60 * 9);
  }

  return token;
}


const post = (data, cb) => {
  let valid = true;
  try {
    Hoek.assert(keystore, new Error('Keystore has not been initialized'));
    validateData(data);
  } catch (err) {
    valid = false;
    cb(err);
  }

  if (valid) {
    getToken(data)
      .then(jwt => {
        const options = {
          payload: data.payload,
          timeout: webhookConfig.timeout,
          headers: {
            Authorization: 'Bearer ' + jwt,
          }
        };

        Wreck.post(data.url, options, (err, response, payload) => {
          cb(err, response);
        });
      })
      .catch(err => {
        cb(err);
      });
  }
}

if (webhookConfig) {
  Hoek.assert(adapters[webhookConfig.adapter], new Error(`${webhookConfig.adapter} is not a valid webhook queue adapter`));
  queue = adapters[webhookConfig.adapter](post, report);
  module.exports = function getQueue() {
    return {
      async enqueue(data) {
        Hoek.assert(keystore, new Error('Keystore has not been initialized'));
        validateData(data);

        // initialize the auth token
        await getToken(data);

        try {
          queue.enqueue(data);
        } catch(e) {
          logger.error(e);
        }
      }
    };
  };
} else {
  // webhooks disabled
  module.exports = () => ({ enqueue: () => Promise.resolve() });
}
