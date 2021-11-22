const sinon = require('sinon');
const s3 = require('../../src/lib/s3');

module.exports = {
  mockS3Upload() {
    const mock = sinon.mock('upload').returns({
      promise: () => new Promise(resolve => resolve({})),
    });
    sinon.replace(s3, 'upload', mock);
    return mock;
  },
  mockS3GetObject() {
    sinon.replace(s3, 'getObject', params => {
      return {
        promise: () => new Promise(resolve => resolve({})),
        createReadStream: () => new Promise(resolve => resolve({})),
      };
    });
  },
  mockS3HeadObject() {
    sinon.replace(s3, 'headObject', params => {
      return {
        promise: () => new Promise(resolve => resolve({ ContentType: 'image/jpeg' })),
      };
    });
  },
  mockS3CopyObject() {
    sinon.replace(s3, 'copyObject', params => {
      return {
        promise: () => new Promise(resolve => resolve({})),
      };
    });
  },
  mockS3DeleteObject() {
    sinon.replace(s3, 'deleteObject', params => {
      return {
        promise: () => new Promise(resolve => resolve({})),
      };
    });
  },
};