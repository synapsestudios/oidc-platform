const winston = require('winston');
const util = require('util');
const transports = [new winston.transports.Console()];

if (process.env.SENTRY_DSN) {
  const Raven = require('raven');
  const sentryLogger = winston.transports.CustomLogger = function () {
    this.name = 'sentryLogger';
    this.level = 'error';
  };
  util.inherits(sentryLogger, winston.Transport);
  sentryLogger.prototype.log = function (level, msg, meta, callback) {
    Raven.captureException(meta);
    callback(null, true);
  };
  transports.push(new sentryLogger());
}


if (process.env.ROLLBAR_ACCESS_TOKEN) {
  const Rollbar = require('rollbar');
  const rollbar = new Rollbar(process.env.ROLLBAR_ACCESS_TOKEN);

  const rollbarLogger = winston.transports.CustomLogger = function () {
    this.name = 'rollbarLogger';
    this.level = 'error';
  };
  util.inherits(rollbarLogger, winston.Transport);
  rollbarLogger.prototype.log = function (level, msg, meta, callback) {
    rollbar.error(meta.message, meta);
    callback(null, true);
  };
  transports.push(new rollbarLogger());
}

module.exports = new winston.Logger({
  transports: transports,
  filters: [
    (level, msg, meta) => msg.trim(),  // shouldn't be necessary, but good-winston is adding \n
  ],
});
