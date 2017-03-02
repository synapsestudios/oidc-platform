const Boom = require('boom');
const get = require('lodash/get');

exports.register = function (server, pluginOptions, next) {

  server.auth.scheme('access_token', (server, schemeOptions) => {
    const provider = server.plugins['open-id-connect'].provider;

    const onInvalidAccessToken = (request, reply) => {
      const clientId = get(request, 'query.client_id') || get(request, 'payload.client_id');
      const redirectUri = request.query.redirect_uri || request.payload.redirect_uri;
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
        return reply(Boom.forbidden('invalid access token'));
      }
    };

    return {
      authenticate(request, reply) {
        let tokenString;
        if (request.method === 'get') {
          tokenString = request.query.access_token;
        }
        if (!tokenString) {
          const authorization = request.headers.Authorization || '';
          tokenString = authorization.split(' ')[1];
        }

        if (!tokenString) {
          return onInvalidAccessToken(request, reply);
        }

        provider.AccessToken.find(tokenString).then(token => {
          if (token) {
            token.scope = token.scope.split(' ');
            reply.continue({ credentials: token });
          } else {
            return onInvalidAccessToken(request, reply);
          }
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
