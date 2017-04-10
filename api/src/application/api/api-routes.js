const Joi = require('joi');

const hoursTillExpirationSchema = Joi.number().integer().greater(0).default(48);

module.exports = (userService, mixedValidation, rowNotExists, rowExists) => [
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
            email: Joi.string().email().required(),
            app_metadata: Joi.object(),
            profile: Joi.object(),
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
          request.payload.hours_till_expiration
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
          hours_till_expiration: hoursTillExpirationSchema,
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
          email: Joi.string().email().required()
        }
      }
    }
  }
];

module.exports['@singleton'] = true;
module.exports['@require'] = [
  'user/user-service',
  'validator/mixed-validation',
  'validator/constraints/row-not-exists',
  'validator/constraints/row-exists',
];
