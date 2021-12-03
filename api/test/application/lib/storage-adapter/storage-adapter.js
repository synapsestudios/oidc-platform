const Lab = require('@hapi/lab');
const Code = require('@hapi/code');
const { truncateAll } = require('../../../helpers/db');

const { describe, it, after, beforeEach, afterEach } = (exports.lab =
  Lab.script());
const sinon = require('sinon');
const { expect } = Code;
const { stubConfig } = require('../../../helpers/stubs');

const getStorageAdapter = require('../../../../src/lib/storage-adapter/index');
const getAzureAdapter = require('../../../../src/lib/storage-adapter/azure');
const { mockS3Upload } = require('../../../helpers/s3');

describe('storage adapter', () => {
  let storageAdapter, confidenceGetStub, confidenceLoadStub, s3Upload;

  beforeEach(async () => {
    confidenceGetStub = sinon.stub();
    confidenceLoadStub = sinon.stub();
    stubConfig(confidenceGetStub, confidenceLoadStub);
    s3Upload = mockS3Upload();
  });

  after(async () => {
    await truncateAll();
  });

  afterEach(async () => {
    sinon.restore();
  });

  it(`returns s3 adapter if no storage adapter configured`, async () => {
    confidenceGetStub.returns('');
    getStorageAdapter().upload();
    expect(s3Upload.calledOnce).to.equal(true);
  });

  it(`returns s3 adapter if invalid adapter is configured`, async () => {
    confidenceGetStub.returns('bogus_adapter');
    getStorageAdapter().upload();
    expect(s3Upload.calledOnce).to.equal(true);
  });

  it(`returns azure storage adapter if azure_blob_storage configured`, async () => {
    confidenceGetStub.withArgs('/storageDriver').returns('azure_blob_storage');
    confidenceGetStub.withArgs('/azure/storageAccount').returns('fake_account');
    confidenceGetStub.withArgs('/azure/accessKey').returns('test-key12345');
    confidenceGetStub
      .withArgs('/azure/storageContainer')
      .returns('test-container');

    storageAdapter = getStorageAdapter();
    const azureAdapter = getAzureAdapter();
    expect(storageAdapter).to.equal(azureAdapter);
  });
});
