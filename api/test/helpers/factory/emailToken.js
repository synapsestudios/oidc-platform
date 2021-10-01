const { addDays } = require('date-fns');

const bookshelf = require('../../../src/lib/bookshelf');
const EmailToken = bookshelf.model('email_token');

const initialize = (factory) => {
  factory.define('emailToken', EmailToken, {
    token: factory.chance('string', { alpha: true }),
    expires_at: addDays(new Date(), 1),
  });
};

module.exports = initialize;
