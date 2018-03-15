const winston = require('winston');
const util = require('util');
const transports = [new winston.transports.Console()];

const Rollbar = require('rollbar');
const rollbar = new Rollbar('ff3ef8cca74244eabffb17dc2365e7bb');

const rollbarLogger = winston.transports.CustomLogger = function () {
  this.name = 'rollbarLogger';
  this.level = 'error';
};
util.inherits(rollbarLogger, winston.Transport);
rollbarLogger.prototype.log = function (level, msg, meta, callback) {
  rollbar.error(meta.message, meta);
  callback(null, true);
};



const Raven = require('raven');
const sentryLogger = winston.transports.CustomLogger = function () {
  this.name = 'sentryLogger';
  this.level = 'error';
};
util.inherits(sentryLogger, winston.Transport);
sentryLogger.prototype.log = function (level, msg, meta, callback) {
  Raven.captureMessage(msg);
  callback(null, true);
};

transports.push(new sentryLogger());
transports.push(new rollbarLogger());
module.exports = new winston.Logger({
  transports: transports,
  filters: [
    (level, msg, meta) => msg.trim(),  // shouldn't be necessary, but good-winston is adding \n
  ],
});
