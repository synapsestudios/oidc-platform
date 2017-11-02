const winston = require('winston');
// winston.remove(winston.transports.Console);
module.exports = new winston.Logger({
  transports: [
    new winston.transports.Console(),
  ],
  filters: [
    (level, msg, meta) => msg.trim(),  // shouldn't be necessary, but good-winston is adding \n
  ],
});
