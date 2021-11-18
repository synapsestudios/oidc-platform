const Lab = require('@hapi/lab');
const Code = require('@hapi/code');
const { truncateAll } = require('../../../helpers/db');

const { describe, it, after, beforeEach, afterEach } = exports.lab = Lab.script();
const sinon = require('sinon');
const { expect } = Code;
const { stubConfig } = require("../../../helpers/stubs");

const getStorageAdapter = require('../../../../src/lib/storage-adapter/index');
const getAzureAdapter = require('../../../../src/lib/storage-adapter/azure');
const getS3Adapter = require('../../../../src/lib/storage-adapter/s3');

describe('storage adapter', () => {

    let storageAdapter, confidenceGetStub, confidenceLoadStub;

    beforeEach(async () => {  
      confidenceGetStub = sinon.stub();
      confidenceLoadStub = sinon.stub();
      stubConfig(confidenceGetStub, confidenceLoadStub);
    });

    after(async () => {
      await truncateAll();
    });

    afterEach(async() => {
      sinon.restore();
    });

    it(`expect s3 adapter to contain upload, get, and delete functions`, () => {
        const s3Adapter = getS3Adapter();

        expect(s3Adapter.upload).to.exist();
        expect(s3Adapter.get).to.exist();
        expect(s3Adapter.delete).to.exist();
    });

    it(`expect azure adapter to contain upload, get, and delete functions`, () => {
        confidenceGetStub.withArgs('/storageDriver').returns('azure_blob_storage');
        confidenceGetStub.withArgs('/azure/storageAccount').returns('fake_account');
        confidenceGetStub.withArgs('/azure/accessKey').returns('test-key12345');
        confidenceGetStub.withArgs('/azure/storageContainer').returns('test-container');

        const azureAdapter = getAzureAdapter();

        expect(azureAdapter.upload).to.exist();
        expect(azureAdapter.get).to.exist();
        expect(azureAdapter.delete).to.exist();
    });

    it(`returns s3 adapter if no storage adapter configured`, async () => {
        confidenceGetStub.returns('');
        storageAdapter = getStorageAdapter();
        const s3Adapter = getS3Adapter();
        expect(storageAdapter).to.equal(s3Adapter);
    });

    it(`returns s3 adapter if invalid adapter is configured`, async () => {
        confidenceGetStub.returns('bogus_adapter');
        
        storageAdapter = getStorageAdapter();
        const s3Adapter = getS3Adapter();
        expect(storageAdapter).to.equal(s3Adapter);
    });

    it(`returns azure storage adapter if azure_blob_storage configured`, async () => {
        confidenceGetStub.withArgs('/storageDriver').returns('azure_blob_storage');
        confidenceGetStub.withArgs('/azure/storageAccount').returns('fake_account');
        confidenceGetStub.withArgs('/azure/accessKey').returns('test-key12345');
        confidenceGetStub.withArgs('/azure/storageContainer').returns('test-container');

        storageAdapter = getStorageAdapter();
        const azureAdapter = getAzureAdapter();
        expect(storageAdapter).to.equal(azureAdapter);
    });
})