const RollbarTransport = require('winston-rollbar-transport').default;
const winston = require('winston');
const SentryTransport = require('@synapsestudios/winston-sentry');

const transports = [new winston.transports.Console()];

if (process.env.SENTRY_DSN) {
  const Sentry = require('./sentry');
  transports.push(
    new SentryTransport({
      Sentry,
      // Filter out timestamp so errors are grouped together better
      formatter: (options) => options.message.replace(/\d{6}\/\d{6}\.\d{3},\s\[.*\]\smessage:\s(.*),\s.*/, '$1')
    })
  )
}

if (process.env.ROLLBAR_ACCESS_TOKEN) {
  transports.push(new RollbarTransport({
    rollbarAccessToken: process.env.ROLLBAR_ACCESS_TOKEN,
    level: 'error',
  }));
}

module.exports = new winston.Logger({
  transports: transports,
  filters: [
    (level, msg) => msg.replace(/"id_token_hint":".*"/i, `"id_token_hint":"[redacted]"`),
    (level, msg) => msg.trim(),  // shouldn't be necessary, but good-winston is adding \n
  ],
});
