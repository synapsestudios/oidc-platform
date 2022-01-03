const ioc = require('electrolyte');
const sinon = require('sinon');

module.exports = {
  async mockSendEmail() {
    const emailService = await ioc.create('email/email-service');

    const mock = sinon.mock('send').returns({
      promise: () => Promise.resolve()
    }).atLeast(0);
    sinon.replace(
      emailService,
      'send',
      mock
    );
    return mock;
  }
}
