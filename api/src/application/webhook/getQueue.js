const Wreck = require('wreck');
const Hoek = require('hoek');
const IoRedis = require('ioredis');
const {
  JWS: { createSign },
  JWK: { asKeyStore },
} = require('node-jose');

const adapters = require('./queue-adapters');
const webhooksConfig = require('../../../config')('/webhooks');
const fetchKeystore = require('../../lib/fetch-keystore');
const redisConfig = require('../../../config')('/redis');

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
    console.error(e);
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

const validateData = data => {
  Hoek.assert(keystore, new Error('Keystore has not been initialized'));
  Hoek.assert(data.alg, new Error('webhook data must contain algorithm'));
  Hoek.assert(data.url, new Error('webhook data must contain url'));
  Hoek.assert(data.payload, new Error('webhook data must contain payload'));
  Hoek.assert(data.client_id, new Error('webhook data must contain client_id'));
}

const post = (data, cb) => {
  let valid = true;
  try {
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


queue = adapters[webhooksConfig.adapter](post);
// validate the adapter
// figure out what to do when webhooks are turned off

module.exports = function getQueue() {
  return {
    async enqueue(data) {
      validateData(data);
      // initialize the auth token
      await getToken(data);
      return queue.enqueue(data);
    }
  };
};


