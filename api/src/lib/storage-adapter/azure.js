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

    await blockBlobClient.uploadStream(
      stream,
      undefined, // Keep default bufferSize
      undefined, // Keep default maxConcurrency
      options
    );

    const filename = (
      `https://${process.env.AZURE_STORAGE_ACCOUNT}.blob.core.windows.net/` +
      `${process.env.OIDC_AZURE_STORAGE_CONTAINER}/${blobName}`
    );
    return filename;
  },

  async get(container, blob) {
    const containerClient = blobServiceClient.getContainerClient(container);
    const blobClient = containerClient.getBlobClient(blob);

    const downloadBlockBlobResponse = await blobClient.download();
    const downloaded = await streamToString(downloadBlockBlobResponse.readableStreamBody);
    return downloaded;
  },

  delete(pathToBlob) {
    const blobName = pathToBlob.replace(`${process.env.OIDC_AZURE_STORAGE_CONTAINER}/`, '');
    const containerClient = blobServiceClient.getContainerClient(process.env.OIDC_AZURE_STORAGE_CONTAINER);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    return blockBlobClient.delete();
  },
};
