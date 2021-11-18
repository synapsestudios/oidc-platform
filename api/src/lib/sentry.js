const version = require('../../package.json').version;
const config = require('../../config');

const Sentry = require('@sentry/node');

Sentry.init({
  dsn: config('/errorLogging/sentryDSN'),
  release: version,
  environment: config('/env'),
  transport: (config('/errorLogging/testkitTransport') && require('../../test/lib/sentry-testkit').sentryTransport)
})


module.exports = Sentry;
