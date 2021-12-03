const bookshelf = require('../../../src/lib/bookshelf');
const User = bookshelf.model('client_redirect_uri');

const initialize = factory => {
  factory.define('clientRedirectUri', User,  {
    uri: 'https://sso-client.test/redirect',
  });
};

module.exports = initialize;
