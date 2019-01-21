const Joi = require('joi');
const webhookService = require('../webhook/webhook-service');
const userFormData = require('../user/user-form-data');
const Readable = require('stream').Readable;
const bookshelf = require('../../lib/bookshelf');
const hoursTillExpirationSchema = Joi.number().integer().greater(0).default(48);

const ONE_MEGABYTE = 1048576;
const filePayloadConfig = {
  failAction: 'ignore', // set payload to null if picture is too large
  output: 'stream',
  maxBytes: ONE_MEGABYTE,
  parse: true,
  allow: 'multipart/form-data'
};

const userProfilePayloadValidation = Joi.object().keys({
  name: Joi.string().allow(''),
  given_name: Joi.string().allow(''),
  family_name: Joi.string().allow(''),
  middle_name: Joi.string().allow(''),
  nickname: Joi.string().allow(''),
  preferred_username: Joi.string().allow(''),
  profile: Joi.string().uri().allow(''),
  shouldClearPicture: Joi.boolean(),
  picture: Joi.object().type(Readable).assert(
    'hapi.headers.content-type',
    Joi.any().valid(['image/jpeg', 'image/jpg', 'image/png', 'application/octet-stream'])
  ),
  website: Joi.string().uri().allow(''),
  email: Joi.string().email().allow(''),
  gender: Joi.string().allow(''),
  birthdate: Joi.string().isoDate().allow(''),
  zoneinfo: Joi.string().valid(userFormData.timezones),
  locale: Joi.string().valid(Object.keys(userFormData.locales)),
  phone_number: Joi.string().allow(''),
  'address.street_address': Joi.string().allow(''),
  'address.locality': Joi.string().allow(''),
  'address.region': Joi.string().allow(''),
  'address.postal_code': Joi.string().allow(''),
  'address.country': Joi.string().allow(''),
}).invalid(null).label('picture') // null payload means picture size validation failed

module.exports = (userService, clientService, mixedValidation, rowNotExists, rowExists, clientValidator, userEmails, apiService) => [
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
            email: Joi.string().email().regex(/[\*%]+/g, { invert: true }).required(),
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
          email: Joi.string(),
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
          email: Joi.string().email().regex(/[\*%]+/g, { invert: true }).required(),
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
  {
    method: 'POST',
    path: '/api/update-email/{userId}',
    handler: async (request, reply) => {
      const { email } = request.payload;
      const client = await clientService.findById(request.query.client_id);
      await userService.update(request.params.userId, { pending_email: email, pending_email_lower: email.toLowerCase() });
      const user = await userService.findById(request.params.userId);
      await Promise.all([
        userEmails.sendChangeEmailVerifyEmail(user, client, email, request.query),
        userEmails.sendChangeEmailAlertEmail(user, client, user.attributes.email),
      ]);

      reply().send(204);
    },
    config: {
      auth: {
        strategy: 'client_credentials',
        scope: 'superadmin',
      },
      validate: {
        params: mixedValidation({
          userId: Joi.any().required(),
        }, {
          userId: rowExists('user', 'id', 'User not found')
        }),
        payload: mixedValidation({
          email: Joi.string().email().regex(/[\*%]+/g, { invert: true }).required(),
        }, {
          email: rowNotExists('user', 'email', 'Email already in use')
        }),
        query: mixedValidation({
          client_id: Joi.string().required(),
          redirect_uri: Joi.string().required(),
        }, {
          client_id: clientValidator,
        }),
      }
    }
  },
  {
    method: 'PUT',
    path: '/api/user/profile',
    handler: async (request, reply) => {
      const user = await bookshelf.model('user')
        .where({id: request.auth.credentials.accountId})
        .fetch();
      reply(apiService.updateUserProfile(user, request.payload));
    },
    config: {
      payload: filePayloadConfig,
      auth: {
        strategy: 'access_token',
      },
      validate: {
        options: {
          allowUnknown: true,
        },
        payload: userProfilePayloadValidation,
      }
    }
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
  'user/user-emails',
  'api/api-service',
];
