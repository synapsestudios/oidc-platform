const Boom = require('boom');

exports.register = function (server, pluginOptions, next) {
  server.auth.scheme('oidc_session', (server, schemeOptions) => {
    return {

      async authenticate(request, reply) {
        const session = await request.server.plugins['open-id-connect'].provider.Session.find(request.state._session);

        if (!session.accountId()) {
          reply(Boom.forbidden());
        } else {
          reply.continue({
            credentials: session,
          });
        }
      }

    };
  });

  next();
};

exports.register.attributes = {
  name: 'oidc-session-scheme',
  version: '1.0.0'
};
