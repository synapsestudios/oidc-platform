if (process.env.OIDC_STORAGE_DRIVER === 'azure_blob_storage') {
  module.exports = require('./azure');
} else {
  module.exports = require('./s3');
};
