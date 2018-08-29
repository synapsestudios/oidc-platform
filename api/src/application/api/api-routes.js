const Joi = require('joi');
const webhookService = require('../webhook/webhook-service');

const hoursTillExpirationSchema = Joi.number().integer().greater(0).default(48);

module.exports = (userService, clientService, mixedValidation, rowNotExists, rowExists, clientValidator) => [
  {
    method: 'POST',
    path: '/api/invite',
    handler: (request, reply) => {
      reply(userService.inviteUser(request.payload));
    },
    config: {
      auth: {
        strategy: 'client_credentials',
        scope: 'admin'
      },
      validate: {
        payload: mixedValidation(
          {
            client_id: Joi.string().required(),
            email: Joi.string().email().required(),
            redirect_uri: Joi.string().required(),
            response_type: Joi.string().required(),
            scope: Joi.string().required(),
            nonce: Joi.string(),
            app_metadata: Joi.object(),
            profile: Joi.object(),
            subject: Joi.string(),
            template: Joi.string(),
            hours_till_expiration: hoursTillExpirationSchema,
          },
          {
            email: rowNotExists('user', 'email', 'Email already in use'),
            client_id: clientValidator,
          }
        )
      }
    }
  },
  {
    method: 'POST',
    path: '/api/resend-invite/{userId}',
    handler: (request, reply) => {
      const { params, payload } = request
      reply(userService.resendUserInvite({ userId: params.userId, ...payload}));
    },
    config: {
      auth: {
        strategy: 'client_credentials',
        scope: 'admin'
      },
      validate: {
        params: mixedValidation({
          userId: Joi.any().required(),
        }, {
          userId: rowExists('user', 'id', 'User not found')
        }),
        payload: mixedValidation({
          client_id: Joi.string().required(),
          redirect_uri: Joi.string().required(),
          response_type: Joi.string().required(),
          scope: Joi.string().required(),
          subject: Joi.string(),
          nonce: Joi.string(),
          hours_till_expiration: hoursTillExpirationSchema,
          template: Joi.string(),
        }, {
          client_id: clientValidator,
        })
      },
    }
  },
  {
    method: 'GET',
    path: '/api/users',
    handler: (request, reply) => {
      reply(userService.getUsers(request.query));
    },
    config: {
      auth: {
        strategy: 'client_credentials',
        scope: 'admin'
      },
      validate: {
        query: {
          ids: Joi.array().items(Joi.string()).single(),
          email: Joi.string().email()
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/api/users',
    handler: (request, reply) => {
      const { email, password } = request.payload;
      reply(userService.create(email, password));
    },
    config: {
      auth: {
        strategy: 'client_credentials',
        scope: 'admin'
      },
      validate: {
        payload: mixedValidation({
          email: Joi.string().email().required(),
          password: Joi.string(),
        }, {
          email: rowNotExists('user', 'email', 'Email already in use')
        })
      }
    }
  },
  {
    method: 'POST',
    path: '/api/send-verification/{userId}',
    handler: (request, reply) => {
      reply(
        userService.sendUserVerification(
          request.params.userId,
          request.payload.client_id,
          request.payload.redirect_uri,
        )
      );
    },
    config: {
      auth: {
        strategy: 'client_credentials',
        scope: 'admin',
      },
      validate: {
        params: mixedValidation({
          userId: Joi.any().required(),
        }, {
          userId: rowExists('user', 'id', 'User not found'),
        }),
        payload: mixedValidation({
          client_id: Joi.string().required(),
          redirect_uri: Joi.string().required(),
        }, {
          client_id: clientValidator,
        }),
      },
    },
  },
  {
    method: 'POST',
    path: '/api/webhooks',
    handler: (request, reply) => {
      reply(webhookService.create(
        request.auth.credentials.clientId,
        request.payload.url,
        request.payload.events
      ));
    },
    config: {
      auth: {
        strategy: 'client_credentials',
        scope: 'admin',
      },
      validate: {
        payload: {
          events: Joi.array().items(Joi.any().valid(webhookService.events)).min(1),
          url: Joi.string().required(),
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/api/forgot-password/{userId}',
    handler: (request, reply) => {
      reply(
        userService.sendForgotPassword(
          request.params.userId,
          request.payload.client_id,
          request.payload.redirect_uri,
        )
      );
    },
    config: {
      auth: {
        strategy: 'client_credentials',
        scope: 'admin',
      },
      validate: {
        params: mixedValidation({
          userId: Joi.any().required(),
        }, {
          userId: rowExists('user', 'id', 'User not found'),
        }),
        payload: mixedValidation({
          client_id: Joi.string().required(),
          redirect_uri: Joi.string().required(),
        }, {
          client_id: clientValidator,
        }),
      },
    },
  },
];

module.exports['@singleton'] = true;
module.exports['@require'] = [
  'user/user-service',
  'client/client-service',
  'validator/mixed-validation',
  'validator/constraints/row-not-exists',
  'validator/constraints/row-exists',
  'validator/constraints/client-validator',
];
