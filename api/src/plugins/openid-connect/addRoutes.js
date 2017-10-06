const querystring = require('querystring');

module.exports = (server, issuer, options) => {
  server.route({
    method: 'GET',
    path: '/interaction/{grant}',
    handler: async (request, reply) => {
      const cookie = await server.plugins['open-id-connect'].provider.interactionDetails(request.raw.req);
      const client = server.plugins['open-id-connect'].provider.Client.find(cookie.params.client_id);

      if (cookie.interaction.error === 'login_required') {
        reply.view('login', {
          client,
          cookie,
          title: 'Log In',
          debug: querystring.stringify(cookie.params, ',<br/>', ' = ', {
            encodeURIComponent: value => value,
          }),
          interaction: querystring.stringify(cookie.interaction, ',<br/>', ' = ', {
            encodeURIComponent: value => value,
          }),
          forgotPasswordPath: `${issuer}/user/forgot-password?client_id=${cookie.params.client_id}&response_type=${cookie.params.response_type}&scope=${cookie.params.scope}&redirect_uri=${cookie.params.redirect_uri}&nonce=${cookie.params.nonce}`,
        });
      } else {
        reply.view('interaction', {
          client,
          cookie,
          title: 'Authorize',
          debug: querystring.stringify(cookie.params, ',<br />', ' = ', {
            encodeURIComponent: value => value,
          }),
          interaction: querystring.stringify(cookie.interaction, ',<br/>', ' = ', {
            encodeURIComponent: value => value,
          }),
        });
      }
    },
    config: {
      state: {
        parse: false // hapi fails to parse oidc cookie...
      }
    }
  });

  server.route({
    method: 'POST',
    path: '/interaction/{grant}/confirm',
    handler: (request, reply) => {
      const result = { consent: {} };
      server.plugins['open-id-connect'].provider.interactionFinished(request.raw.req, request.raw.res, result);
    },
    config: {
      state: {
        parse: false
      }
    }
  });

  server.route({
    method: 'POST',
    path: '/interaction/{grant}/login',
    handler: (request, reply) => {
      options.authenticateUser(request.payload.login, request.payload.password)
        .then(account => {
          if (account) {
            const result = {
              login: {
                account: account.accountId,
                acr: 'urn:mace:incommon:iap:bronze',
                amr: ['pwd'],
                remember: request.payload.remember,
                ts: Math.floor(Date.now() / 1000),
              },
              consent: {}
            };
            server.plugins['open-id-connect'].provider.interactionFinished(request.raw.req, request.raw.res, result);
          } else {
            const cookie = server.plugins['open-id-connect'].provider.interactionDetails(request.raw.req);
            const client = server.plugins['open-id-connect'].provider.Client.find(cookie.params.client_id);
            reply.view('login', {
              error: 'Invalid email password combination',
              client,
              cookie,
              title: 'Log In',
              debug: querystring.stringify(cookie.params, ',<br/>', ' = ', {
                encodeURIComponent: value => value,
              }),
              interaction: querystring.stringify(cookie.interaction, ',<br/>', ' = ', {
                encodeURIComponent: value => value,
              }),
            });
          }
        });
    },
    config: {
      state: {
        parse: false
      }
    }
  });
}
