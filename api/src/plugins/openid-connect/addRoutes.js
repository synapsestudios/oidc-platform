const Joi = require('joi');
const querystring = require('querystring');
const views = require('./views');

module.exports = (server, issuer, options) => {
  server.route({
    method: 'GET',
    path: '/interaction/{grant}',
    handler: async (request, reply) => {
      const provider = server.plugins['open-id-connect'].provider;
      const cookie = await provider.interactionDetails(request.raw.req);
      const client = await provider.Client.find(cookie.params.client_id);

      if (cookie.interaction.error === 'login_required') {
        const viewContext = views.login(cookie, client, options);
        const template = await options.getTemplate(client.clientId, 'login', viewContext);
        reply(template);
      } else {
        const viewContext = views.interaction(cookie, client);
        const template = await options.getTemplate(client.clientId, 'interaction', viewContext);
        reply(template);
      }
    },
    config: {
      validate: {
        headers: {
          cookie: Joi.string().required(),
        },
        options: {
          allowUnknown: true,
        }
      },
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
      validate: {
        headers: {
          cookie: Joi.string().required(),
        },
        options: {
          allowUnknown: true,
        }
      },
      state: {
        parse: false
      }
    }
  });

  server.route({
    method: 'POST',
    path: '/interaction/{grant}/login',
    handler: async (request, reply) => {
      const account = await options.authenticateUser(request.payload.login, request.payload.password);
      const provider = server.plugins['open-id-connect'].provider;
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
        const cookie = await provider.interactionDetails(request.raw.req);
        const client = await provider.Client.find(cookie.params.client_id);
        const viewContext = views.login(cookie, client, options, 'Invalid email password combination', request.payload.login);
        const template = await options.getTemplate(client.clientId, 'login', viewContext);

        reply(template);
      }
    },
    config: {
      validate: {
        headers: {
          cookie: Joi.string().required(),
        },
        options: {
          allowUnknown: true,
        }
      },
      state: {
        parse: false
      }
    }
  });
};
