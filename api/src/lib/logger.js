const RollbarTransport = require('winston-rollbar-transport').default;
const Sentry = require('winston-raven-sentry');
const winston = require('winston');
const transports = [new winston.transports.Console()];
const config = require('../../config');

if (process.env.SENTRY_DSN) {
  transports.push(new Sentry({
    dsn: process.env.SENTRY_DSN,
    level: 'error',
    config: {
      environment: config('/env'),
    },
  }));
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
    (level, msg, meta) => msg.trim(),  // shouldn't be necessary, but good-winston is adding \n
  ],
});
