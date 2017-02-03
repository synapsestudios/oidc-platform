'use strict';
const OidcProvider = require('oidc-provider');
const cors = require('koa-cors');
const querystring = require('querystring');

const handlebars = require('handlebars');

exports.register = function (server, options, next) {
  const issuer = options.issuer || 'http://localhost:9000';

  const prefix = options.prefix ? `/${options.prefix}` : '/op';
  const provider = new OidcProvider(issuer, {
    adapter: options.adapter,
    findById: options.findUserById,
    routes: {
      authorization: `${prefix}/auth`,
      certificates: `${prefix}/certs`,
      check_session: `${prefix}/session/check`,
      end_session: `${prefix}/session/end`,
      introspection: `${prefix}/token/introspection`,
      registration: `${prefix}/reg`,
      revocation: `${prefix}/token/revocation`,
      token: `${prefix}/token`,
      userinfo: `${prefix}/me`,
    },
    acrValues: ['session', 'urn:mace:incommon:iap:bronze'],
    cookies: {
      long: { signed: true },
      short: { signed: true },
    },
    discovery: {
      service_documentation: '',
      version: '',
    },
    claims: {
      amr: null,
      address: ['address'],
      email: ['email', 'email_verified'],
      phone: ['phone_number', 'phone_number_verified'],
      profile: ['birthdate', 'family_name', 'gender', 'given_name', 'locale', 'middle_name', 'name',
        'nickname', 'picture', 'preferred_username', 'profile', 'updated_at', 'website', 'zoneinfo'],
    },
    features: {
      devInteractions: false,
      discovery: true,
      claimsParameter: true,
      clientCredentials: false,
      encryption: true,
      introspection: true,
      registration: {
        initialAccessToken: options.initialAccessToken,
      },
      registrationManagement: false,
      request: true,
      requestUri: true,
      revocation: true,
      sessionManagement: false,
      backchannelLogout: false,
    },
    subjectTypes: ['public', 'pairwise'],
    pairwiseSalt: 'da1c442b365b563dfc121f285a11eedee5bbff7110d55c88',
    interactionUrl: function interactionUrl(interaction) {
      // this => koa context;
      return `/interaction/${this.oidc.uuid}`;
    },
  });

  provider.initialize({
    keystore: options.keystores.certificates,
    integrity: options.keystores.integrity,
  })
    .then(() => {
      provider.app.use(cors());
      provider.app.keys = options.cookieKeys;

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
        handler: (request, reply) => {
          const cookie = provider.interactionDetails(request.raw.req);
          const client = provider.Client.find(cookie.params.client_id);

          if (cookie.interaction.error === 'login_required') {
            reply.view('login', {
              client,
              cookie,
              title: 'Sign-in',
              debug: querystring.stringify(cookie.params, ',<br/>', ' = ', {
                encodeURIComponent: value => value,
              }),
              interaction: querystring.stringify(cookie.interaction, ',<br/>', ' = ', {
                encodeURIComponent: value => value,
              }),
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
            })
            .catch(e => {
              const cookie = provider.interactionDetails(request.raw.req);
              const client = provider.Client.find(cookie.params.client_id);
              reply.view('login', {
                error: 'Invalid email password combination',
                client,
                cookie,
                title: 'Sign-in',
                debug: querystring.stringify(cookie.params, ',<br/>', ' = ', {
                  encodeURIComponent: value => value,
                }),
                interaction: querystring.stringify(cookie.interaction, ',<br/>', ' = ', {
                  encodeURIComponent: value => value,
                }),
              });

            });
        },
        config: {
          state: {
            parse: false
          }
        }
      });

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
