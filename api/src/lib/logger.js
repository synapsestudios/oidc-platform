const winston = require('winston');
module.exports = new winston.Logger({
  transports: [
    new winston.transports.Console(),
  ],
  filters: [
    (level, msg, meta) => msg.trim(),  // shouldn't be necessary, but good-winston is adding \n
  ],
});
