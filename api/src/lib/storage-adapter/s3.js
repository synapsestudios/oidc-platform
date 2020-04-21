const s3 = require('./s3');
const s3Bucket = require('../../../config')('/aws/s3Bucket');

module.exports = {
  upload(stream, key, contentType) {
    return s3.upload({ Bucket: s3Bucket, Body: stream, Key: key, ContentType: contentType, CacheControl: 'public, must-revalidate, proxy-revalidate, max-age=0' })
      .promise()
      .then(data => data.Location)
      .catch(error => {
        const trace = new Error(error);
        logger.error(trace);
        throw error;
      });
  },

  get(container, key) {
    var params = {
      Bucket: container,
      Key: key
    };
    return new Promise((resolve, reject) => {
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
    });
  },

  delete(key) {
    const bucket = new s3({ params: { Bucket: s3Bucket } });

    return new Promise((resolve, reject) => {
      bucket.deleteObject({ Key: key })
        .send((err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve(key);
          }
        });
    })
      .catch((error) => {
        const trace = new Error(error);
        logger.error(trace);
        throw error;
      });
  },
};
