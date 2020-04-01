const s3 = require('../../lib/s3');
const s3Bucket = require('../../../config')('/aws/s3Bucket');
const logger = require('../../lib/logger');

module.exports = () => ({
  uploadImageStream(stream, key) {
    const contentType = (stream.hapi && stream.hapi.headers['content-type']) ?
      stream.hapi.headers['content-type'] : 'application/octet-stream';

    return s3.upload({ Bucket: s3Bucket, Body: stream, Key: key, ContentType: contentType, CacheControl: 'public, must-revalidate, proxy-revalidate, max-age=0' })
      .promise()
      .then(data => data.Location)
      .catch(error => {
        const trace = new Error(error);
        logger.error(trace);
        throw error;
      });
  },

  deleteImage(filename) {
    const bucket = new s3({ params: { Bucket: s3Bucket } });

    return new Promise((resolve, reject) => {
      bucket.deleteObject({ Key: filename })
        .send((err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve(filename);
          }
        });
    })
      .catch((error) => {
        const trace = new Error(error);
        logger.error(trace);
        throw error;
      });
  },
});

module.exports['@singleton'] = true;
module.exports['@require'] = [];
