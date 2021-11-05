const bookshelf = require('../../../src/lib/bookshelf');
const User = bookshelf.model('user');
const config = require('../../../config');

const initialize = factory => {
  factory.define('user', User,  {
    id: factory.chance('guid', { version: 4 }),
    app_metadata: {},
    profile: {
      email_verified: false,
      phone_number_verified: false,
    },
    email: factory.chance('email', { domain: config('email/domain') || 'example.com' }),
    email_lower: factory.chance('email', { domain: config('email/domain') || 'example.com' }),
  });
};

module.exports = initialize;
