const s3 = require('aws-sdk').S3;
const s3Bucket = require('../../../config')('/aws/s3Bucket');
const logger = require('../../lib/logger');

module.exports = () => ({
  uploadImageStream(stream, key) {
    const contentType = (stream.hapi && stream.hapi.headers['content-type']) ?
      stream.hapi.headers['content-type'] : 'application/octet-stream';
    const filename = key;

    const bucket = new s3({ params: { Bucket: s3Bucket } });
    return bucket.upload({ Body: stream, Key: filename, ContentType: contentType })
      .promise()
      .then(data => data.location)
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
