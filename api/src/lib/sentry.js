const version = require('../../package.json').version;
const env = require('../../config')('/env');
const Sentry = require('@sentry/node');
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  release: version,
  environment: env,
});

module.exports = Sentry;
