import { testkit } from 'sentry-testkit/dist/jestMock';

const Lab = require('@hapi/lab');
const Code = require('@hapi/code');
const { truncateAll } = require('../../helpers/db');

const { describe, it, before, after, beforeEach, afterEach } = exports.lab = Lab.script();
const sinon = require('sinon');
const { expect } = Code;
const logger = require('../../src/lib/logger');

describe('error logging', () => {

    before(async () => {

    });

    beforeEach(async () => {
        
    });

    after(async () => {
      await truncateAll();
    });

    afterEach(async() => {
      sinon.restore();
    });

    it(`sentry sends a report on error as expected`, async () => {
        logger.error(`Reported error to sentry`);
        expect(testkit.reports().length).toBeGreaterThan(0);
    });
})
