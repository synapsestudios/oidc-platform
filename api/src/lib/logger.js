const winston = require('winston');
const util = require('util');
const Raven = require('raven');
const transports = [new winston.transports.Console()];
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
module.exports = new winston.Logger({
  transports: transports,
  filters: [
    (level, msg, meta) => msg.trim(),  // shouldn't be necessary, but good-winston is adding \n
  ],
});
