const config = require('../../../config');
const azureStorage = require('./azure');
const s3 = require('./s3');

module.exports = () => {
  if (config('/storageDriver') === 'azure_blob_storage') {
    return azureStorage();
  } else {
    return s3();
  }
};
