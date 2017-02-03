const AWS = require('aws-sdk');
const s3 = new AWS.S3({apiVersion: '2006-03-01'});
const defaultKeystores = require('../../keystores');

module.exports = function() {
  return new Promise((resolve, reject) => {
    if (process.env.KEYSTORE && process.env.KEYSTORE_BUCKET) {
      var params = {
        Bucket: process.env.KEYSTORE_BUCKET, /* required */
        Key: process.env.KEYSTORE, /* required */
      };
      s3.getObject(params, function(err, data) {
        if (err) {
          console.error(err, err.stack);
          reject(err);
        } else {
          resolve(JSON.parse(data.Body.toString()));
        }
      });
    } else {
      resolve(defaultKeystores);
    }
  });
};
