const Boom = require('boom');
const get = require('lodash/get');
const includes = require('lodash/includes');

exports.register = function (server, pluginOptions, next) {
  server.auth.scheme('access_token', (server, schemeOptions) => {
    if (!schemeOptions || !schemeOptions.token_type) {
      throw new Error('Must specify token_type option');
    }

    let TokenModel;
    switch (schemeOptions.token_type) {
      case 'access_token':
        TokenModel = 'AccessToken';
        break;
      case 'client_credentials':
        TokenModel = 'ClientCredentials';
        break;
      default:
        throw new Error('Invalid token type');
    }

    const provider = server.plugins['open-id-connect'].provider;

    const onInvalidAccessToken = (request, reply) => {
      const clientId = get(request, 'query.client_id') || get(request, 'payload.client_id');
      const redirectUri = get(request, 'query.redirect_uri') || get(request, 'payload.redirect_uri');
      if (clientId && redirectUri) {
        provider.Client.find(clientId).then(client => {
          if (!client) {
            return reply(Boom.notFound('Client not found'));
          }
          if (client.redirectUris.indexOf(request.query.redirect_uri) < 0) {
            return reply(Boom.forbidden('redirect_uri not in whitelist'));
          } else {
            return reply.redirect(`${redirectUri}?error=unauthorized&error_description=invalid access token`);
          }
        });
      } else {
        return reply(Boom.unauthorized(null, 'access_token'));
      }
    };

    return {
      authenticate(request, reply) {
        let tokenString;
        if (request.query) {
          tokenString = request.query.access_token;
        }
        if (!tokenString) {
          const authorization = get(request, 'headers.authorization', '');
          tokenString = authorization.split(' ')[1];
        }

        if (!tokenString) {
          return onInvalidAccessToken(request, reply);
        }

        provider[TokenModel].find(tokenString).then(token => {
          if (token) {
            token.scope = token.scope.split(' ');

            if (includes(token.scope, 'superadmin')) {
              const provider = server.plugins['open-id-connect'].provider;
              provider.Client.find(token.clientId).then(client => {

                if (!client) {
                  return reply(Boom.notFound('Client not found'));
                }

                if (!client.superadmin) {
                  return reply(Boom.forbidden('invalid superadmin scope'));
                }

                reply.continue({ credentials: token });
              });
            } else {
              reply.continue({ credentials: token });
            }
          } else {
            return onInvalidAccessToken(request, reply);
          }
        }).catch(e => {
          reply(Boom.badImplementation(null, e));
        });
      }
    };
  });

  next();
};

exports.register.attributes = {
  name: 'access-token-scheme',
  version: '1.0.0'
};
