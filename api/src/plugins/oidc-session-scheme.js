const Boom = require('boom');

exports.register = function (server, pluginOptions, next) {
  server.auth.scheme('oidc_session', () => {
    return {
      async authenticate(request, reply) {
        // only do this when cookies aren't present and some token hint is provided or whatever
        // await server.plugins['open-id-connect'].provider.setProviderSession(request.raw.req, request.raw.res, {
        //   account: '5b5b85ab-dfce-4d9b-b34e-7d8ff34cf35c'
        // });

        // const koaCtx = server.plugins['open-id-connect'].provider.app.createContext(request.raw.req, request.raw.res);
        // const x = await request.server.plugins['open-id-connect'].provider.Session.find(koaCtx.cookies.get('_session'));
        // console.log(x);

        if (!request.state._session) {
          reply(Boom.forbidden());
        } else {
          try {
            var session = await request.server.plugins['open-id-connect'].provider.Session.find(request.state._session);
            if (!session.accountId()) {
              reply(Boom.forbidden());
            } else {
              reply.continue({
                credentials: session,
              });
            }
          } catch(e) {
            reply(e);
          }
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
