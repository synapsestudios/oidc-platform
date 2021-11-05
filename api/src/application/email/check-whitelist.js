const _ = require('lodash');
const config = require('../../../config');

const options = {
  trap: config('email/trap'),
  whitelist: config('email/whitelist') ? config('email/whitelist').split(',') : null,
};

const nonAlphaNumericPattern = /\W/g;
const domainPattern = /@(.*)$/;

module.exports = (emailAddress, reject) => {
  if (options.whitelist && !options.trap) {
    reject('trap option must be set if using whitelist');
  }

  if (options.trap && (!options.whitelist || !options.whitelist.length) ) {
    reject('whitelist option must be set if using email trap');
  }

  if (!options.whitelist || !options.whitelist.length) {
    return emailAddress;
  }

  const domain = emailAddress.match(domainPattern)[1];

  if (_.findIndex(options.whitelist, (whitelisted) => domain.toLowerCase() === whitelisted.toLowerCase()) >= 0) {
    return emailAddress;
  }

  if (!options.trap) {
    reject('trap option must be set if using whitelist');
  }
  else {
    const intendedRecipient = emailAddress.replace(nonAlphaNumericPattern, '');
    const [ user, host ] = options.trap.split('@');

    return `${user}+${intendedRecipient}@${host}`;
  }
};
