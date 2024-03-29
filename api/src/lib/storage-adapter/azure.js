const config = require('../../../config');
const { BlobServiceClient, StorageSharedKeyCredential } = require('@azure/storage-blob');
const streamToString = require('../stream-to-string');

module.exports = function () {
  const azureStorageAccount = config('/azure/storageAccount');
  const azureAccessKey = config('/azure/accessKey');
  const azureStorageContainer = config('/azure/storageContainer');

  const sharedKeyCredential = new StorageSharedKeyCredential(
    azureStorageAccount,
    azureAccessKey
  );

  const blobServiceClient = new BlobServiceClient(
    `https://${azureStorageAccount}.blob.core.windows.net`,
    sharedKeyCredential
  );

  return {
    async upload(stream, blobName, contentType) {
      const containerClient = blobServiceClient.getContainerClient(
        azureStorageContainer
      );
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      const options = {
        blobHTTPHeaders: {
          blobContentType: contentType,
          blobCacheControl:
            'public, must-revalidate, proxy-revalidate, max-age=0',
        },
      };

      await blockBlobClient.uploadStream(
        stream,
        undefined, // Keep default bufferSize
        undefined, // Keep default maxConcurrency
        options
      );

      const filename =
        `https://${azureStorageAccount}.blob.core.windows.net/` +
        `${azureStorageContainer}/${blobName}`;
      return filename;
    },

    async get(container, blob) {
      const containerClient = blobServiceClient.getContainerClient(container);
      const blobClient = containerClient.getBlobClient(blob);

      const downloadBlockBlobResponse = await blobClient.download();
      const downloaded = await streamToString(
        downloadBlockBlobResponse.readableStreamBody
      );
      return downloaded;
    },

    delete(pathToBlob) {
      const blobName = pathToBlob.replace(`${azureStorageContainer}/`, '');
      const containerClient = blobServiceClient.getContainerClient(
        azureStorageContainer
      );
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      return blockBlobClient.delete();
    },
  };
};
