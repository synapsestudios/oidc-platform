const config = require('../../../config');
const mailgun = require('./drivers/mailgun');
const ses = require('./drivers/ses');
const logger = require('../../lib/logger');

const drivers = { mailgun, ses };

module.exports = () => {
  if (drivers[config('/email')]) {
    return new drivers[config('/email')]();
  } else {
    return {
      send: () => {
        logger.error(`You're attempting to send an email without an email provider configured!`);
      }
    };
  }
};

module.exports['@singleton'] = true;
