const Lab = require('@hapi/lab');
const Code = require('@hapi/code');
const { truncateAll } = require('../../helpers/db');

const { describe, it, before, after, beforeEach, afterEach } = exports.lab = Lab.script();
const sinon = require('sinon');
const { expect } = Code;
const getSendGridDriver = require('../../../src/application/email/drivers/sendgrid');
const sgMail = require('@sendgrid/mail');

describe('send email with sendgrid', () => {

    let sendGridDriver;

    const email_template = {
      to: 'test@example.com', 
      subject: 'Welcome', 
      html: '<h1>Welcome to ODIC!</h1>', 
      from: 'no-reply@example.com'
    };


    before(async () => {
      sendGridDriver = getSendGridDriver();      
    });

    beforeEach(async () => {
      sinon.stub(sgMail, "send").yields(null, "resolved");
    });

    after(async () => {
      await truncateAll();
    });

    afterEach(async() => {
      sinon.restore();
    });

    it(`throws error if no to address provided`, async () => {
        const email = { ...email_template, to: '' };
        await expect(sendGridDriver.send(email)).to.reject(Error, 'no to address provided');
        expect(sgMail.send.calledOnce).to.equal(false);
    });

    it(`throws error if no subject is provided`, async () => {
        const email = { ...email_template, subject: '' };
        await expect(sendGridDriver.send(email)).to.reject(Error, 'no subject provided');
        expect(sgMail.send.calledOnce).to.equal(false);
    });

    it(`throws error if no text or html body provided`, async () => {
        const email = { ...email_template, html: '' };
        await expect(sendGridDriver.send(email)).to.reject(Error, 'no text or html body provided');
        expect(sgMail.send.calledOnce).to.equal(false);
    });

    it(`throws error if attachments are not provided as an array`, async () => {
      const email = { ...email_template, attachments: {} };
      await expect(sendGridDriver.send(email)).to.reject(Error, 'attachments must be an array');
      expect(sgMail.send.calledOnce).to.equal(false);
    });

    it(`sends an email when given a valid email object`, async () => {
      const email = { ...email_template, attachments: [] };
      const response = await sendGridDriver.send(email);
      expect(response).to.equal("resolved");
      expect(sgMail.send.calledOnce).to.equal(true);
    });
})