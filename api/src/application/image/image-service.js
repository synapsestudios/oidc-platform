const s3 = require('aws-sdk').S3;
const s3Bucket = require('../../../config')('/aws/s3Bucket');

module.exports = () => ({
  uploadImageStream(stream, key) {
    const extPattern = /\.([A-Za-z\d])*$/;
    const streamFilename = (stream.hapi && stream.hapi.filename) ? stream.hapi.filename : '';
    const contentType = (stream.hapi && stream.hapi.headers['content-type']) ?
      stream.hapi.headers['content-type'] : 'application/octet-stream';
    const extension = streamFilename.match(extPattern) ? streamFilename.match(extPattern)[0] : '';
    const filename = key + extension;

    const bucket = new s3({ params: { Bucket: s3Bucket } });

    return new Promise((resolve, reject) => {
      bucket.upload({ Body: stream, Key: filename, ContentType: contentType })
        .send((err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve(data.Location);
          }
        });
    })
      .catch((error) => {
        console.trace(error);
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
        console.trace(error);
        throw error;
      });
  },
});

module.exports['@singleton'] = true;
module.exports['@require'] = [];
