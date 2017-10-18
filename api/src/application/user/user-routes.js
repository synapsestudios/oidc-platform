const Joi = require('joi');
const Readable = require('stream').Readable;
const userFormData = require('./user-form-data');
const Boom = require('boom');
const views = require('./user-views');

const queryValidation = {
  client_id : Joi.string().required(),
  response_type : Joi.string().required(),
  scope : Joi.string().required(),
  redirect_uri : Joi.string().required(),
  nonce : Joi.string().optional(),
};

const clientValidator = server => async (value, options) => {
  const provider = server.plugins['open-id-connect'].provider;

  const client = await provider.Client.find(value);
  if (!client) throw Boom.notFound('Client not found');

  const redirectUri = options.context.values.redirect_uri;
  if (client.redirectUris.indexOf(redirectUri) < 0) throw Boom.forbidden('redirect_uri not in whitelist');

  return value;
}

module.exports = (service, controller, mixedValidation, validationError, server, formHandler) => {
  const emailSettingsHandler = formHandler('email-settings', views.emailSettings, async (request, reply, user, client) => {
    // handle post somehow
  });

  const changePasswordHandler = formHandler('change-password', views.changePassword, controller.changePassword);
  const registerHandler = formHandler('user-registration', views.userRegistration, controller.register);
  const profileHandler = formHandler('user-profile', views.userProfile, controller.updateProfile);

  return [
    {
      method : 'GET',
      path : '/user/register',
      handler : registerHandler,
      config : {
        validate : {
          failAction : registerHandler,
          query : queryValidation,
        }
      },
    },
    {
      method : 'POST',
      path : '/user/register',
      handler : registerHandler,
      config : {
        validate : {
          payload : {
            email : Joi.string().email().required(),
            password : Joi.string().min(8).required(),
            pass2 : Joi.any().valid(Joi.ref('password')).required(),
          },
          query : queryValidation,
          failAction : registerHandler,
        }
      },
    },
    {
      method: 'GET',
      path: '/user/email-settings',
      handler: emailSettingsHandler,
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
            client_id: clientValidator(server),
          }),
        }
      }
    },
    {
      method: 'GET',
      path: '/user/password',
      handler: changePasswordHandler,
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
            client_id: clientValidator(server),
          }),
        }
      }
    },
    {
      method: 'POST',
      path: '/user/password',
      handler: changePasswordHandler,
      config: {
        auth: {
          strategy: 'oidc_session',
        },
        validate: {
          failAction : changePasswordHandler,
          query: mixedValidation({
            client_id: Joi.string().required(),
            redirect_uri: Joi.string().required(),
            profile: Joi.string(),
          }, {
            client_id: clientValidator(server),
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
      handler: profileHandler,
      config: {
        auth: {
          strategy: 'oidc_session',
        },
        validate: {
          query: mixedValidation({
            client_id: Joi.string().required(),
            redirect_uri: Joi.string().required(),
          }, {
            client_id: clientValidator(server),
          }),
        }
      }
    },
    {
      method: 'POST',
      path: '/user/profile',
      handler: profileHandler,
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
          // failAction: controller.profileFormHandler,
          failAction: profileHandler,
          query: mixedValidation({
            client_id: Joi.string().required(),
            redirect_uri: Joi.string().required(),
          }, {
            client_id: clientValidator(server),
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
      handler : controller.getForgotPasswordForm,
      config : {
        validate : {
          failAction : controller.getForgotPasswordForm,
          query : queryValidation,
        },
      },
    },
    {
      method : 'POST',
      path : '/user/forgot-password',
      handler : controller.postForgotPasswordForm,
      config : {
        validate : {
          payload : {
            email : Joi.string().email().required(),
          },
          query : queryValidation,
          failAction : controller.getForgotPasswordForm,
        }
      },
    },
    {
      method : 'GET',
      path : '/user/reset-password',
      handler : controller.getResetPasswordForm('Reset Password'),
      config : {
        validate : {
          failAction : controller.getResetPasswordForm('Reset Password'),
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
      handler : controller.postResetPasswordForm('Reset Password'),
      config : {
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
          failAction : controller.getResetPasswordForm('Reset Password'),
        }
      },
    },
    {
      method: 'GET',
      path: '/user/accept-invite',
      handler: controller.getResetPasswordForm('Set Password'),
      config: {
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
      handler: controller.postResetPasswordForm('Set Password'),
      config: {
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
          failAction: controller.getResetPasswordForm('Set Password'),
        },
      },
    },
    {
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
    },
  ];
};

module.exports['@singleton'] = true;
module.exports['@require'] = [
  'user/user-service',
  'user/user-controller',
  'validator/mixed-validation',
  'validator/validation-error',
  'server',
  'form-handler',
];
