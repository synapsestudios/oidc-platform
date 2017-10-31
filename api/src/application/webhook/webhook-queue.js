const adapters = require('./queue-adapters');
const webhooksConfig = require('../../../config')('/webhooks');
const fetchKeystore = require('../../lib/fetch-keystore');

const {
  JWK: { asKeyStore },
} = require('node-jose')


// validate the adapter
// figure out what to do when webhooks are turned off
module.exports = adapters[webhooksConfig.adapter]();

fetchKeystore()
  .then(asKeyStore)
  .then(keystore => {
    module.exports.setKeystore(keystore);
  });
