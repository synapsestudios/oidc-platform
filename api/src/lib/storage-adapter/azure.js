const { BlobServiceClient, StorageSharedKeyCredential } = require('@azure/storage-blob');

const sharedKeyCredential = new StorageSharedKeyCredential(
  process.env.AZURE_STORAGE_ACCOUNT,
  process.env.AZURE_STORAGE_ACCESS_KEY
);
const blobServiceClient = new BlobServiceClient(
  `https://${process.env.AZURE_STORAGE_ACCOUNT}.blob.core.windows.net`,
  sharedKeyCredential
);

// [Node.js only] A helper method used to read a Node.js readable stream into string
async function streamToString(readableStream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readableStream.on("data", (data) => {
      chunks.push(data.toString());
    });
    readableStream.on("end", () => {
      resolve(chunks.join(""));
    });
    readableStream.on("error", reject);
  });
}

module.exports = {
  async upload(stream, blobName, contentType) {
    const containerClient = blobServiceClient.getContainerClient(process.env.OIDC_AZURE_STORAGE_CONTAINER);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    const options = {
      blobHTTPHeaders: {
        blobContentType: contentType,
        blobCacheControl: 'public, must-revalidate, proxy-revalidate, max-age=0'
      }
    };

    // Have to include these or the upload has zero bytes and no content type.
    const defaults = { bufferSize: 8 * 1024 * 1024, maxBuffers: 5 };

    return blockBlobClient.uploadStream(
      stream,
      defaults.bufferSize,
      defaults.maxBuffers,
      options
    );
  },

  async get(container, blob) {
    const containerClient = blobServiceClient.getContainerClient(container);
    const blobClient = containerClient.getBlobClient(blob);

    const downloadBlockBlobResponse = await blobClient.download();
    const downloaded = await streamToString(downloadBlockBlobResponse.readableStreamBody);
    return downloaded;
  },

  delete() {

  },
};
