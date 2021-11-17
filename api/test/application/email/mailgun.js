const Lab = require('@hapi/lab');
const Code = require('@hapi/code');
const { truncateAll } = require('../../helpers/db');

const { describe, it, before, after, beforeEach, afterEach } = exports.lab = Lab.script();
const sinon = require('sinon');
const { expect } = Code;
const getMailgunDriver = require('../../../src/application/email/drivers/mailgun');

describe('send email with mailgun', () => {

    let mailgunDriver, mailgunClient, mailgunStub;

    const email_template = {
      to: 'test@example.com', 
      subject: 'Welcome', 
      html: '<h1>Welcome to ODIC!</h1>', 
      from: 'no-reply@example.com'
    };

    before(async () => {
      mailgunDriver = getMailgunDriver();
      mailgunClient = mailgunDriver.client();
    });

    beforeEach(async () => {
      mailgunStub = sinon.stub().yields(null, "resolved");
      sinon.stub(mailgunClient, 'messages').returns({
        send: mailgunStub
      });
    });

    after(async () => {
      await truncateAll();
    });

    afterEach(async() => {
      sinon.restore();
    });

    it(`throws error if no to address provided`, async () => {
        const email = { ...email_template, to: '' };
        await expect(mailgunDriver.send(email)).to.reject(Error, 'no to address provided');
        expect(mailgunClient.messages().send.calledOnce).to.equal(false);
    });

    it(`throws error if no subject is provided`, async () => {
        const email = { ...email_template, subject: '' };
        await expect(mailgunDriver.send(email)).to.reject(Error, 'no subject provided');
        expect(mailgunClient.messages().send.calledOnce).to.equal(false);
    });

    it(`throws error if no text or html body provided`, async () => {
        const email = { ...email_template, html: '' };
        await expect(mailgunDriver.send(email)).to.reject(Error, 'no text or html body provided');
        expect(mailgunClient.messages().send.calledOnce).to.equal(false);
    });

    it(`throws error if attachments are not in an array`, async () => {
      const email = { ...email_template, attachments: {} };
      await expect(mailgunDriver.send(email)).to.reject(Error, 'attachments must be an array');
      expect(mailgunClient.messages().send.calledOnce).to.equal(false);
    });

    it(`sends an email when given a valid email object`, async () => {
        const email = { ...email_template };
        const response = await mailgunDriver.send(email);
        expect(mailgunClient.messages().send.calledOnce).to.equal(true);
        expect(response).to.equal("resolved");
    });
})