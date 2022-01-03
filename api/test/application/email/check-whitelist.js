const Lab = require('@hapi/lab');
const Code = require('@hapi/code');
const { truncateAll } = require('../../helpers/db');

const { describe, it, after, before, beforeEach, afterEach } = exports.lab = Lab.script();
const sinon = require('sinon');
const { expect } = Code;
const { stubConfig } = require("../../helpers/stubs");
const checkWhitelist = require('../../../src/application/email/check-whitelist');
const logger = require('../../../src/lib/logger');


describe('white list', () => {

    let confidenceGetStub, confidenceLoadStub;

    function fakeReject(message) {
        return new Promise((resolve, reject) => reject(message));
    }

    before(async () => {
        logger.transports['console'].silent = true;
    })

    beforeEach(async () => {  
      confidenceGetStub = sinon.stub();
      confidenceLoadStub = sinon.stub();
      stubConfig(confidenceGetStub, confidenceLoadStub);

    });

    after(async () => {
      await truncateAll();
      logger.transports['console'].silent = false;
    });

    afterEach(async() => {
      sinon.restore();
    });

    it(`rejects with error if whitelist is set with no trap`, async () => {
        confidenceGetStub.withArgs('email/trap').returns('');
        confidenceGetStub.withArgs('email/whitelist').returns('valid.com');

        await expect(checkWhitelist('myemail@valid.com', fakeReject)).to.reject(Error, 'trap option must be set if using whitelist');
    });

    it(`rejects with error if trap is set with no whitelist`, async () => {
        confidenceGetStub.withArgs('email/trap').returns('admin@reject-domain.com');
        confidenceGetStub.withArgs('email/whitelist').returns('');

        await expect(checkWhitelist('myemail@valid.com', fakeReject)).to.reject(Error, 'whitelist option must be set if using email trap');
    });

    it(`returns the email address if no whitelist or trap is set`, async () => {
        confidenceGetStub.withArgs('email/trap').returns('');
        confidenceGetStub.withArgs('email/whitelist').returns('');

        const response = checkWhitelist('myemail@valid.com', fakeReject);
        expect(response).to.equal('myemail@valid.com');
    });

    it(`returns the email address if domain is in the whitelist`, async () => {
        confidenceGetStub.withArgs('email/trap').returns('admin@reject-domain.com');
        confidenceGetStub.withArgs('email/whitelist').returns('valid.com');

        const response = checkWhitelist('myemail@valid.com', fakeReject);
        expect(response).to.equal('myemail@valid.com');
    });

    it(`returns the email routed to the trap if domain is not in the whitelist`, async () => {
        confidenceGetStub.withArgs('email/trap').returns('admin@reject-domain.com');
        confidenceGetStub.withArgs('email/whitelist').returns('valid.com');

        const response = checkWhitelist('myemail@invalid.com', fakeReject);
        expect(response).to.equal('admin+myemailinvalidcom@reject-domain.com');
    });
})   