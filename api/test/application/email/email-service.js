const Lab = require('@hapi/lab');
const Code = require('@hapi/code');
const { truncateAll } = require('../../helpers/db');

const { describe, it, after, beforeEach, afterEach } = exports.lab = Lab.script();
const sinon = require('sinon');
const { expect } = Code;
const getEmailService = require('../../../src/application/email/email-service');
const { stubConfig } = require("../../helpers/stubs");

const sgMail = require('@sendgrid/mail');
const AWS = require('aws-sdk-mock');
const path = require('path');
AWS.setSDK(path.resolve(__dirname, '../../../node_modules/aws-sdk')) 

const getMailgunDriver = require('../../../src/application/email/drivers/mailgun');
const Mailgun = require('mailgun-js');

describe('email service', () => {

    let emailService, confidenceGetStub, confidenceLoadStub;

    const email_template = {
      to: 'test@example.com', 
      subject: 'Welcome', 
      html: '<h1>Welcome to ODIC!</h1>', 
      from: 'no-reply@example.com'
    };

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

    it(`logs error if no driver is configured`, async () => {
        sinon.spy(console, 'log');

        confidenceGetStub.returns('');
        
        emailService = getEmailService();

        await emailService.send(email_template);

        expect( console.log.calledOnce ).to.be.true;
        expect( console.log.calledWith(`You're attempting to send an email without an email provider configured!`) ).to.be.true;
    });

    it(`logs error if configured with non-valid driver`, async () => {
        sinon.spy(console, 'log');

        confidenceGetStub.returns('fake-driver');
        
        emailService = getEmailService();

        await emailService.send(email_template);

        expect( console.log.calledOnce ).to.be.true;
        expect( console.log.calledWith(`You're attempting to send an email without an email provider configured!`) ).to.be.true;
    });

    it(`sendgrid configuration sends email`, async () => {
        sinon.stub(sgMail, "send").yields(null, "resolved");

        confidenceGetStub.returns('sendgrid');
        
        emailService = getEmailService();

        const response = await emailService.send(email_template);
        expect(response).to.equal("resolved");
        expect(sgMail.send.calledOnce).to.equal(true);
    });

    it(`ses configuration sends email`, async () => {        
        sinon.spy(console, 'log');

        confidenceGetStub.returns('ses');
        
        emailService = getEmailService();

        sendEmailStub = sinon.stub().resolves("resolved");
        AWS.mock("SES", "sendEmail", sendEmailStub);
        const response = await emailService.send(email_template);
        expect(sendEmailStub.calledOnce).to.equal(true);
        expect(response).to.equal("resolved");
        AWS.restore();
    });

    it(`mailgun configuration sends email`, async () => {

      confidenceGetStub.withArgs('/email/driver').returns('mailgun');
      confidenceGetStub.withArgs('/email/mailgunApiKey').returns('test-key');
      confidenceGetStub.withArgs('/email/domain').returns('test.com');

      const mailgunDriver = getMailgunDriver();
      const mailgunClient = mailgunDriver.client();
      const mailgunStub = sinon.stub().yields(null, "resolved");
      sinon.stub(Mailgun({ apiKey: 'foo', domain: 'bar' }).Mailgun.prototype, 'messages').returns({
        send: mailgunStub,
      });
       
      emailService = getEmailService();
      const response = await emailService.send(email_template);

      expect(mailgunClient.messages().send.calledOnce).to.equal(true);
      expect(response).to.equal("resolved");
    });
})