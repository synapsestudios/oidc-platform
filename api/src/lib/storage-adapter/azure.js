const { BlobServiceClient, StorageSharedKeyCredential } = require('@azure/storage-blob');

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
    return blockBlobClient.uploadStream(stream, {
      blobHTTPHeaders: {
        blobContentType: contentType,
        blobCacheControl: 'public, must-revalidate, proxy-revalidate, max-age=0'
      }
    });
  },

  async get(container, blob) {
    const sharedKeyCredential = new StorageSharedKeyCredential(
      process.env.AZURE_STORAGE_ACCOUNT,
      process.env.AZURE_STORAGE_ACCESS_KEY
    );

    const blobServiceClient = new BlobServiceClient(
      `https://${process.env.AZURE_STORAGE_ACCOUNT}.blob.core.windows.net`,
      sharedKeyCredential
    );
    const containerClient = blobServiceClient.getContainerClient(container);
    const blobClient = containerClient.getBlobClient(blob);

    const downloadBlockBlobResponse = await blobClient.download();
    const downloaded = await streamToString(downloadBlockBlobResponse.readableStreamBody);
    return downloaded;
  },

  delete() {

  },
};
