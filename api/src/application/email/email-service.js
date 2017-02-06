const config = require('../../../config');
const mailgun = require('./drivers/mailgun');

const drivers = { mailgun };

module.exports = (bookshelf) => {
  if (!drivers[config('/email')]) {
    throw 'Invalid email driver, please set OIDC_EMAIL_DRIVER';
  }
  return drivers[config('/email')]();
};

module.exports['@singleton'] = true;
module.exports['@require'] = ['bookshelf'];
