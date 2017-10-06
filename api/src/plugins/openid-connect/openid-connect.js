'use strict';
const OidcProvider = require('oidc-provider');
const cors = require('koa2-cors');
const querystring = require('querystring');
const path = require('path');
const fs = require('fs');
const handlebars = require('handlebars');
const passwordGrant = require('./grants/password');
const getConfig = require('./getConfig');

exports.register = function (server, options, next) {
  const issuer = options.issuer || process.env.OIDC_BASE_URL || 'http://localhost:9000';

  const prefix = options.prefix ? `/${options.prefix}` : '/op';
  const provider = new OidcProvider(issuer, getConfig(options));

  provider.initialize({
    adapter: options.adapter,
    keystore: options.keystore,
  })
    .then(() => {
      const { grantTypeFactory, params } = passwordGrant(options);
      provider.registerGrantType('password', grantTypeFactory, params);

      provider.app.use(cors());
      provider.app.keys = options.cookieKeys;
      provider.app.proxy = true;
      server.ext('onRequest', function(request, reply) {
        if (request.path.substring(0, prefix.length) === prefix) {
          provider.callback(request.raw.req, request.raw.res);
        } else {
          return reply.continue();
        }
      });

      server.views({
        engines: {
          hbs: handlebars
        },
        relativeTo: __dirname,
        path: 'templates',
        layout: true,
        layoutPath: './templates/layout',
      });

      server.route({
        method: 'GET',
        path: '/interaction/{grant}',
        handler: async (request, reply) => {
          const cookie = await provider.interactionDetails(request.raw.req);
          const client = provider.Client.find(cookie.params.client_id);

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
          provider.interactionFinished(request.raw.req, request.raw.res, result);
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
                provider.interactionFinished(request.raw.req, request.raw.res, result);
              } else {
                const cookie = provider.interactionDetails(request.raw.req);
                const client = provider.Client.find(cookie.params.client_id);
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

      server.expose('provider', provider);

      next();
    })
    .catch(e => {
      console.error(e);
    });
};

exports.register.attributes = {
  name: 'open-id-connect',
  version: '1.0.0'
};
