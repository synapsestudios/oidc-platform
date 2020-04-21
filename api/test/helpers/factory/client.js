const bookshelf = require('../../../src/lib/bookshelf');
const Client = bookshelf.model('client');

const initialize = factory => {
  factory.define('client', Client,  {
    client_id: factory.chance('guid', { version: 4 }),
    client_secret: factory.chance('guid', { version: 4 }),
    client_name: factory.chance('word'),
    client_uri: 'https://sso-client.test',
    application_type: 'web',
    id_token_signed_response_alg: 'RS256',
  }, {
    afterCreate: async (model, attrs, buildOptions) => {
      await factory.create('clientRedirectUri', { client_id: model.get('client_id') })
      return model;
    },
  });
};

module.exports = initialize;
