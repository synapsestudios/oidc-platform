const config = require('../../../config');
const mailgun = require('./drivers/mailgun');

const drivers = { mailgun };

module.exports = () => {
  if (drivers[config('/email')]) {
    return drivers[config('/email')]();
  } else {
    return {
      send: () => {
        console.log(`You're attempting to send an email without an email provider configured!`);
      }
    };
  }
};

module.exports['@singleton'] = true;
