const bookshelf = require('../../../src/lib/bookshelf');
const User = bookshelf.model('user');
const config = require('../../../config');

const initialize = (factory) => {
  factory.define('user', User, () => {
    const email = factory.chance('email', {
      domain: config('email/domain') || 'example.com',
    })();
    return {
      id: factory.chance('guid', { version: 4 }),
      app_metadata: {},
      profile: {
        email_verified: false,
        phone_number_verified: false,
      },
      email: email,
      email_lower: email.toLowerCase(),
      password: '$2a$10$AT/dmHSTdfkOhKlmUiEXH.h1Vqb16EhNl1PLbD.4hr/h0ZKB0OLU2', // `testpassword`
    };
  });
};

module.exports = initialize;
