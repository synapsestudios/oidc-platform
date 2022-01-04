const bookshelf = require('../../../src/lib/bookshelf');
const ClientGrant = bookshelf.model('client_grant');

const initialize = (factory) => {
  factory.define('clientGrant', ClientGrant, {});
};

module.exports = initialize;
