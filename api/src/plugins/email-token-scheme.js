const Boom = require('boom');

exports.register = function (server, pluginOptions, next) {
  server.auth.scheme('email_token', (server, schemeOptions) => {
    return {
      async authenticate(request, reply) {
        if (!request.query.token) {
          return reply(Boom.forbidden());
        }
        try {
          var token = await schemeOptions.findToken(request.query.token);
          var user = token ? await schemeOptions.findUser(token.get('user_id')) : null;
        } catch(e) {
          return reply(e);
        }

        if (token && user) {
          reply.continue({
            credentials: {
              user,
              token,
            }
          });
        } else {
          return reply(Boom.forbidden());
        }
      }

    };
  });
  next();
};

exports.register.attributes = {
  name: 'email-token-scheme',
  version: '1.0.0'
};
