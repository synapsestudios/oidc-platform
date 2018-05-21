const AWS = require('aws-sdk');
const s3 = new AWS.S3({ apiVersion: '2006-03-01' });
const defaultKeystore = require('../../keystore');
const logger = require('./logger');

module.exports = function() {
  return new Promise((resolve, reject) => {
    if (process.env.KEYSTORE && process.env.KEYSTORE_BUCKET) {
      var params = {
        Bucket: process.env.KEYSTORE_BUCKET /* required */,
        Key: process.env.KEYSTORE /* required */,
      };
      s3.getObject(params, function(err, data) {
        if (err) {
          logger.error('Error fetching keystores from s3');
          const trace = new Error(err);
          logger.error(trace);
          reject(err);
        } else {
          resolve(JSON.parse(data.Body.toString()));
        }
      });
    } else {
      const msg =
        'DEPRECATION WARNING:\nThe Synapse OpenID Connect platform provides a default set of keys so that\nit will work if you do not provide your own, but \n\nDO NOT USE THE DEFAULTS IN PRODUCTION.\n\nUse of these keys in a non-development environment will be removed\nin the next version and OIDC will not start.';
      logger.log('info', msg);
      resolve(defaultKeystore);
    }
  });
};
