const storageAdapter = require('../../lib/storage-adapter');

module.exports = () => ({
  uploadImageStream(stream, key) {
    const contentType = (stream.hapi && stream.hapi.headers['content-type']) ?
      stream.hapi.headers['content-type'] : 'application/octet-stream';

    return storageAdapter.upload(
      stream,
      key,
      contentType
    );
  },

  deleteImage(filename) {
    return storageAdapter.delete(filename);
  },
});

module.exports['@singleton'] = true;
module.exports['@require'] = [];
