const Lab = require('@hapi/lab');
const Code = require('@hapi/code');
const { describe, it, before } = exports.lab = Lab.script();
const sinon = require('sinon');
const { expect } = Code;
const getSendGrid = require('../../../src/application/email/drivers/sendgrid');

describe('send email with sendgrid', () => {
    let emailService;

    const email_template = {
      to: 'test@example.com', 
      subject: 'Welcome', 
      html: '<h1>Welcome to ODIC!</h1>', 
      from: 'no-reply@example.com'
    };

    before(async () => {
      emailService = getSendGrid();
    });

    it(`throws error if no to address provided`, async () => {
        const email = { ...email_template, to: '' };

        try {
          await emailService.send(email);
        } catch (err) {
          expect(err).to.equal('no to address provided')
        }
    });

    it(`throws error if no subject is provided`, async () => {
        const email = { ...email_template, subject: '' };

        try {
          await emailService.send(email);
        } catch (err) {
          expect(err).to.equal('no subject provided')
        }
    });

    it(`throws error if no text or html body provided`, async () => {
        const email = { ...email_template, html: '' };

        try {
          await emailService.send(email);
        } catch (err) {
          expect(err).to.equal('no text or html body provided')
        }
    });

    

    it(`send email if it passes whitelist`, async () => {
      emailService.send= sinon.stub().callsFake(params => {
        return {
          promise: () => new Promise(resolve => resolve({})),
        };
      });

      await emailService.send(email_template);

      expect(emailService.send.calledOnce).to.equal(true);

      sinon.restore();

  });
})