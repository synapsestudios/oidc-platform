const bookshelf = require('../../../src/lib/bookshelf');
const Client = bookshelf.model('client');

const initialize = (factory) => {
  factory.define(
    'client',
    Client,
    {
      client_id: factory.chance('guid', { version: 4 }),
      client_secret: factory.chance('guid', { version: 4 }),
      client_name: factory.chance('word'),
      client_uri: 'https://sso-client.test:3000',
      application_type: 'web',
      id_token_signed_response_alg: 'RS256',
    },
    {
      afterCreate: async (model, attrs, buildOptions) => {
        await factory.create('clientRedirectUri', {
          client_id: model.get('client_id'),
          uri: model.get('client_uri') + '/',
        });
        await factory.create('clientResponseType', {
          client_id: model.get('client_id'),
          value: 'code',
        });
        await factory.create('clientResponseType', {
          client_id: model.get('client_id'),
          value: 'id_token token',
        });
        await factory.create('clientGrant', {
          client_id: model.get('client_id'),
          grant_type: 'authorization_code',
        });
        await factory.create('clientGrant', {
          client_id: model.get('client_id'),
          grant_type: 'implicit',
        });
        return model;
      },
    }
  );
};

module.exports = initialize;
