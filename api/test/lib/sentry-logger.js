const Lab = require('@hapi/lab');
const Code = require('@hapi/code');
const { truncateAll } = require('../helpers/db');

const { describe, it, before, after, afterEach } = (exports.lab = Lab.script());
const sinon = require('sinon');
const { expect } = Code;
const logger = require('../../src/lib/logger');
const sentryTestkit = require('./sentry-testkit');
const { testkit } = sentryTestkit;
const SentryTransport = require('@synapsestudios/winston-sentry');
const RollbarTransport = require('winston-rollbar-transport').default;

describe('error logging', () => {
  before(async () => {
    logger.transports['console'].silent = true;
  });

  after(async () => {
    await truncateAll();
    logger.transports['console'].silent = false;
  });

  afterEach(async () => {
    sinon.restore();
  });

  it(`sentry sends a report on error as expected`, async () => {
    logger.error(`Reported error to sentry`);
    expect(testkit.reports().length).to.be.greaterThan(0);
  });

  it(`expect SentryTransport log to be called on error`, async () => {
    const sentryStub = sinon.stub(SentryTransport.prototype, 'log');
    logger.error('Reported error to sentry');
    expect(sentryStub.callCount).to.equal(1);
    const args = sentryStub.getCall(0).args;
    expect(args[0]).to.equal('error');
    expect(args[1]).to.equal('Reported error to sentry');
  });

  it(`expect Rollbar log to be called on error if configured`, async () => {
    const rollbarStub = sinon.stub(RollbarTransport.prototype, 'log');
    logger.error('Reported error to rollbar');
    expect(rollbarStub.callCount).to.equal(1);
    const args = rollbarStub.getCall(0).args;
    expect(args[0]).to.equal('error');
    expect(args[1]).to.equal('Reported error to rollbar');
  });
});
