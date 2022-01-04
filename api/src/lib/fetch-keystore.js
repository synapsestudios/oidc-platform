const getStorageAdapter = require('../lib/storage-adapter');
const defaultKeystore = require('../../keystore');
const logger = require('./logger');

module.exports = async function () {
  const storageAdapter = getStorageAdapter();

  const container = process.env.OIDC_STORAGE_DRIVER === 'azure_blob_storage'
    ? process.env.KEYSTORE_CONTAINER
    : process.env.KEYSTORE_BUCKET;
  const key = process.env.KEYSTORE;

  if (container && key) {
    return storageAdapter.get(container, key);
  } else {
    const msg =
      'DEPRECATION WARNING:\nThe Synapse OpenID Connect platform provides a default set of keys so that\nit will work if you do not provide your own, but \n\nDO NOT USE THE DEFAULTS IN PRODUCTION.\n\nUse of these keys in a non-development environment will be removed\nin the next version and OIDC will not start.';
    logger.log('info', msg);
    return defaultKeystore;
  }
};
