const bookshelf = require('../../../src/lib/bookshelf');
const ClientResponseType = bookshelf.model('client_response_type');

const initialize = (factory) => {
  factory.define('clientResponseType', ClientResponseType, {
    value: 'code id_token token',
  });
};

module.exports = initialize;
