const _ = require('lodash');

const options = {
  trap: process.env.OIDC_EMAIL_TRAP,
  whitelist: process.env.OIDC_EMAIL_WHITELIST ? process.env.OIDC_EMAIL_WHITELIST.split(',') : null,
};

module.exports = (emailAddress, reject) => {
  if (!options.whitelist || !options.whitelist.length) {
    return emailAddress;
  }

  const domainPattern = /@(.*)$/;
  const domain = emailAddress.match(domainPattern)[1];

  if (_.findIndex(options.whitelist, (whitelisted) => domain === whitelisted) >= 0) {
    return emailAddress;
  }

  if (!options.trap) {
    reject('trap option must be set if using whitelist');
  }
  else {
    return options.trap;
  }
};


