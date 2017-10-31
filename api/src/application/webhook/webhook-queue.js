const adapters = require('./queue-adapters');
const webhooksConfig = require('../../../config')('/webhooks');

// validate the adapter
// figure out what to do when webhooks are turned off

module.exports = adapters[webhooksConfig.adapter];
