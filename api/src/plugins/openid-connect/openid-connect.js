'use strict';
const OidcProvider = require('oidc-provider');
const cors = require('koa2-cors');
const querystring = require('querystring');
const path = require('path');
const fs = require('fs');
const passwordGrant = require('./grants/password');
const getConfig = require('./getConfig');
const addRoutes = require('./addRoutes');

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

      server.views(options.vision);
      addRoutes(server, issuer, options)

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
