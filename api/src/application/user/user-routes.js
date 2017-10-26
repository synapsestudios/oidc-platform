const Joi = require('joi');
const Readable = require('stream').Readable;
const userFormData = require('./user-form-data');
const Boom = require('boom');
const views = require('./user-views');
const clientInitiatedLogout = require('../../../config')('/clientInitiatedLogout');
const userRegistration = require('../../../config')('/userRegistration');
const bookshelf = require('../../lib/bookshelf');

const queryValidation = {
  client_id : Joi.string().required(),
  response_type : Joi.string().required(),
  scope : Joi.string().required(),
  redirect_uri : Joi.string().required(),
  nonce : Joi.string().optional(),
};

module.exports = (service, controller, mixedValidation, ValidationError, server, formHandler, rowExists, clientValidator) => {
  const emailValidator = async (value, options) => {
    const userCollection = await bookshelf.model('user').where({email_lower: value.toLowerCase()}).fetchAll();
    if (userCollection.length >= 1) {
      throw new ValidationError('That email address is already in use');
    }

    return value;
  }

  const resetPasswordHandler = formHandler('reset-password', views.resetPassword('Reset Password'), controller.resetPassword);
  const setPasswordHandler = formHandler('reset-password', views.resetPassword('Set Password'), controller.resetPassword);

  let routes = [
    {
      method: 'GET',
      path: '/user/email-settings',
      handler: controller.emailSettingsHandler,
      config: {
        auth: {
          strategy: 'oidc_session',
        },
        validate: {
          query: mixedValidation({
            client_id: Joi.string().required(),
            redirect_uri: Joi.string().required(),
            profile: Joi.string(),
          }, {
            client_id: clientValidator,
          }),
        }
      }
    },
    {
      method: 'POST',
      path: '/user/email-settings',
      handler: controller.emailSettingsHandler,
      config: {
        auth: {
          strategy: 'oidc_session',
        },
        validate: {
          failAction: controller.emailSettingsHandler,
          query: mixedValidation({
            client_id: Joi.string().required(),
            redirect_uri: Joi.string().required(),
            profile: Joi.string(),
          }, {
            client_id: clientValidator,
          }),
          payload: mixedValidation({
            action: Joi.any().valid(['reverify', 'new_reverify', 'change', 'cancel_new']).required(),
            email : Joi.string().email().required(),
            current : Joi.alternatives().when('action', {
              is: 'change',
              then: Joi.string().required(),
              otherwise: Joi.any().forbidden()
            }),
          }, {
            email: async (value, options) => {
              if (options.context.values.action === 'change') {
                return emailValidator(value, options);
              } else {
                return value;
              }
            },
          })
        },
      },
    },
    {
      method: 'GET',
      path: '/user/email-verify',
      handler: controller.emailVerifySuccessHandler,
      config: {
        auth: {
          strategy: 'email_token',
        },
        validate: {
          failAction: controller.emailVerifySuccessHandler,
          query: mixedValidation({
            token: Joi.string().guid().required(),
            client_id: Joi.string().required(),
            redirect_uri: Joi.string().required(),
          }, {
            client_id: clientValidator,
          }),
        },
      },
    },
    {
      method: 'GET',
      path: '/user/complete-email-update',
      handler: controller.completeEmailUpdateHandler,
      config: {
        auth: {
          strategy: 'email_token',
        },
        validate: {
          failAction: controller.completeEmailUpdateHandler,
          query: mixedValidation({
            token: Joi.string().guid().required(),
            client_id: Joi.string().required(),
            redirect_uri: Joi.string().required(),
          }, {
            client_id: clientValidator,
          }),
        },
      }
    },
    {
      method: 'GET',
      path: '/user/password',
      handler: controller.changePasswordHandler,
      config: {
        auth: {
          strategy: 'oidc_session',
        },
        validate: {
          query: mixedValidation({
            client_id: Joi.string().required(),
            redirect_uri: Joi.string().required(),
            profile: Joi.string(),
          }, {
            client_id: clientValidator,
          }),
        }
      }
    },
    {
      method: 'POST',
      path: '/user/password',
      handler: controller.changePasswordHandler,
      config: {
        auth: {
          strategy: 'oidc_session',
        },
        validate: {
          failAction :controller.changePasswordHandler,
          query: mixedValidation({
            client_id: Joi.string().required(),
            redirect_uri: Joi.string().required(),
            profile: Joi.string(),
          }, {
            client_id: clientValidator,
          }),
          payload: {
            current: Joi.string().required(),
            password : Joi.string().min(8).required(),
            pass2 : Joi.any().valid(Joi.ref('password')).required(),
          }
        },
      },
    },
    {
      method: 'GET',
      path: '/user/profile',
      handler: controller.profileHandler,
      config: {
        auth: {
          strategy: 'oidc_session',
        },
        validate: {
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
      method: 'POST',
      path: '/user/profile',
      handler: controller.profileHandler,
      config: {
        payload: {
          failAction: 'ignore', // set payload to null if picture is too large
          maxBytes: 1048576, // 1MiB
          output: 'stream',
          parse: true,
          allow: 'multipart/form-data',
        },
        auth: {
          strategy: 'oidc_session',
        },
        validate: {
          failAction: controller.profileHandler,
          query: mixedValidation({
            client_id: Joi.string().required(),
            redirect_uri: Joi.string().required(),
          }, {
            client_id: clientValidator,
          }),
          payload: Joi.object().keys({
            name: Joi.string().allow(''),
            given_name: Joi.string().allow(''),
            family_name: Joi.string().allow(''),
            middle_name: Joi.string().allow(''),
            nickname: Joi.string().allow(''),
            preferred_username: Joi.string().allow(''),
            profile: Joi.string().uri().allow(''),
            picture: Joi.object().type(Readable).assert(
              'hapi.headers.content-type',
              Joi.any().valid(['image/jpeg', 'image/png', 'application/octet-stream'])
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
        }
      },
    },
    {
      method : 'GET',
      path : '/user/forgot-password',
      handler : controller.forgotPasswordHandler,
      config : {
        validate : {
          query : queryValidation,
        },
      },
    },
    {
      method : 'POST',
      path : '/user/forgot-password',
      handler : controller.forgotPasswordHandler,
      config : {
        validate : {
          payload : {
            email : Joi.string().email().required(),
          },
          query : queryValidation,
          failAction : controller.forgotPasswordHandler,
        }
      },
    },
    {
      method : 'GET',
      path : '/user/reset-password',
      handler : resetPasswordHandler,
      config : {
        auth: {
          strategy: 'email_token',
        },
        validate : {
          query : Object.assign({
            token: Joi.string().required(),
            client_id: Joi.string().required(),
            redirect_uri: Joi.string().required(),
            scope: Joi.string().required(),
          }, queryValidation),
        },
      },
    },
    {
      method : 'POST',
      path : '/user/reset-password',
      handler : resetPasswordHandler,
      config : {
        auth: {
          strategy: 'email_token',
        },
        validate : {
          payload : {
            password : Joi.string().min(8).required(),
            pass2 : Joi.any().valid(Joi.ref('password')).required(),
          },
          query : Object.assign({
            token: Joi.string().required(),
            client_id: Joi.string().required(),
            redirect_uri: Joi.string().required(),
            scope: Joi.string().required(),
          }, queryValidation),
          failAction : resetPasswordHandler,
        }
      },
    },
    {
      method: 'GET',
      path: '/user/accept-invite',
      handler: setPasswordHandler,
      config: {
        auth: {
          strategy: 'email_token',
        },
        validate: {
          query: {
            token: Joi.string().guid().required(),
            client_id: Joi.string().required(),
            redirect_uri: Joi.string().required(),
            scope: Joi.string().required(),
            response_type: Joi.string().required(),
            nonce: Joi.string(),
          },
        },
      },
    },
    {
      method: 'POST',
      path: '/user/accept-invite',
      handler: setPasswordHandler,
      config: {
        auth: {
          strategy: 'email_token'
        },
        validate: {
          payload : {
            password : Joi.string().min(8).required(),
            pass2 : Joi.any().valid(Joi.ref('password')).required(),
          },
          query: {
            token: Joi.string().guid().required(),
            client_id: Joi.string().required(),
            redirect_uri: Joi.string().required(),
            scope: Joi.string().required(),
            response_type: Joi.string().required(),
            nonce: Joi.string(),
          },
          failAction: setPasswordHandler,
        },
      },
    },
  ];

  if (clientInitiatedLogout) {
    routes.push({
      method: 'GET',
      path: '/user/logout',
      handler: controller.logout,
      config: {
        validate: {
          query: {
            post_logout_redirect_uri: Joi.string().required(),
          },
        },
      },
    });
  }

  if (userRegistration) {
    routes = [...routes, {
      method : 'GET',
      path : '/user/register',
      handler : controller.registerHandler,
      config : {
        validate : {
          failAction : controller.registerHandler,
          query : queryValidation,
        }
      },
    }, {
      method : 'POST',
      path : '/user/register',
      handler : controller.registerHandler,
      config : {
        validate : {
          payload : mixedValidation({
            email : Joi.string().email().required(),
            password : Joi.string().min(8).required(),
            pass2 : Joi.any().valid(Joi.ref('password')).required(),
          }, {
            email: emailValidator,
          }),
          query : queryValidation,
          failAction : controller.registerHandler,
        }
      },
    }];
  }

  return routes;
};

module.exports['@singleton'] = true;
module.exports['@require'] = [
  'user/user-service',
  'user/user-controller',
  'validator/mixed-validation',
  'validator/validation-error',
  'server',
  'form-handler',
  'validator/constraints/row-exists',
  'validator/constraints/client-validator',
];
