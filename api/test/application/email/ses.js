const Lab = require('@hapi/lab');
const Code = require('@hapi/code');
const { truncateAll } = require('../../helpers/db');

const { describe, it, before, after, beforeEach, afterEach } = exports.lab = Lab.script();
const sinon = require('sinon');
const { expect } = Code;
const getSesDriver = require('../../../src/application/email/drivers/ses');

const AWS = require('aws-sdk-mock');
const path = require('path');
AWS.setSDK(path.resolve(__dirname, '../../../node_modules/aws-sdk')) 

describe('send email with ses', () => {

    let sesDriver, sendEmailStub;

    const email_template = {
      to: 'test@example.com', 
      subject: 'Welcome', 
      html: '<h1>Welcome to ODIC!</h1>', 
      from: 'no-reply@example.com'
    };

    before(async () => {
      sesDriver = new getSesDriver();
    });

    beforeEach(async () => {
        sendEmailStub = sinon.stub().resolves("resolved");
    });

    after(async () => {
      await truncateAll();
    });

    afterEach(async() => {
      sinon.restore();
    });

    it(`throws error if no to address provided`, async () => {
        const email = { ...email_template, to: '' };
        await expect(sesDriver.send(email)).to.reject(Error, 'no to address provided');
        expect(sendEmailStub.calledOnce).to.equal(false);
    });

    it(`throws error if no subject is provided`, async () => {
        const email = { ...email_template, subject: '' };
        await expect(sesDriver.send(email)).to.reject(Error, 'no subject provided');
        expect(sendEmailStub.calledOnce).to.equal(false);
    });

    it(`throws error if no text or html body provided`, async () => {
        const email = { ...email_template, html: '' };
        await expect(sesDriver.send(email)).to.reject(Error, 'no text or html body provided');
        expect(sendEmailStub.calledOnce).to.equal(false);

    });

    it(`throws error if attachments are present`, async () => {
      const email = { ...email_template, attachments: {} };
      await expect(sesDriver.send(email)).to.reject(Error, 'ses driver does not currently support attachments');
      expect(sendEmailStub.calledOnce).to.equal(false);
    });

    it(`sends an email when given a valid email object`, async () => {
        AWS.mock("SES", "sendEmail", sendEmailStub);
        const email = { ...email_template };
        const response = await sesDriver.send(email);
        expect(sendEmailStub.calledOnce).to.equal(true);
        expect(response).to.equal("resolved");
        AWS.restore();
    });
})