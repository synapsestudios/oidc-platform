const Joi = require('joi');

const hoursTillExpirationSchema = Joi.number().integer().greater(0).default(48);

module.exports = (userService, clientService, mixedValidation, rowNotExists, rowExists) => [
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
            app_name: Joi.string().required(),
            client_id: Joi.string().required(),
            email: Joi.string().email().required(),
            redirect_uri: Joi.string().required(),
            scope: Joi.string().required(),
            app_metadata: Joi.object(),
            profile: Joi.object(),
            template: Joi.string(),
            hours_till_expiration: hoursTillExpirationSchema,
          },
          {
            email: rowNotExists('user', 'email', 'Email already in use')
          }
        )
      }
    }
  },
  {
    method: 'POST',
    path: '/api/resend-invite/{userId}',
    handler: (request, reply) => {
      reply(
        userService.resendUserInvite(
          request.params.userId,
          request.payload.app_name,
          request.payload.client_id,
          request.payload.redirect_uri,
          request.payload.scope,
          request.payload.hours_till_expiration,
          request.payload.template
        )
      );
    },
    config: {
      auth: {
        strategy: 'client_credentials',
        scope: 'admin'
      },
      validate: {
        params: mixedValidation(
          {
            userId: Joi.any().required(),
          },
          {
            userId: rowExists('user', 'id', 'User not found')
          }
        ),
        payload: {
          app_name: Joi.string().required(),
          client_id: Joi.string().required(),
          redirect_uri: Joi.string().required(),
          scope: Joi.string().required(),
          hours_till_expiration: hoursTillExpirationSchema,
          template: Joi.string(),
        }
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
    path: '/api/email-templates',
    handler: (request, reply) => {
      const { template, client_id } = request.payload;
      reply(clientService.createResetPasswordTemplate(template, client_id));
    },
    config: {
      auth: {
        strategy: 'client_credentials',
        scope: 'admin'
      },
      validate: {
        payload: {
          template: Joi.string().required(),
          client_id: Joi.string().required(),
        }
      }
    }
  }
];

module.exports['@singleton'] = true;
module.exports['@require'] = [
  'user/user-service',
  'client/client-service',
  'validator/mixed-validation',
  'validator/constraints/row-not-exists',
  'validator/constraints/row-exists',
];
