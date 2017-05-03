const Joi = require('joi');
const Readable = require('stream').Readable;

const queryValidation = {
  client_id : Joi.string().required(),
  response_type : Joi.string().required(),
  scope : Joi.string().required(),
  redirect_uri : Joi.string().required(),
  nonce : Joi.string().optional(),
};

module.exports = (service, controller, userFormData) => {
  return [
    {
      method : 'GET',
      path : '/user/register',
      handler : controller.registerFormHandler,
      config : {
        validate : {
          failAction : controller.registerFormHandler,
          query : queryValidation,
        }
      },
    },
    {
      method : 'POST',
      path : '/user/register',
      handler : controller.registerFormHandler,
      config : {
        validate : {
          payload : {
            email : Joi.string().email().required(),
            password : Joi.string().min(8).required(),
            pass2 : Joi.any().valid(Joi.ref('password')).required(),
          },
          query : queryValidation,
          failAction : controller.registerFormHandler,
        }
      },
    },
    {
      method: 'GET',
      path: '/user/profile',
      handler: controller.profileFormHandler,
      config: {
        auth: {
          strategy: 'access_token',
          scope: 'profile'
        },
        validate: {
          query: {
            client_id: Joi.string().required(),
            access_token: Joi.string().required(),
            redirect_uri: Joi.string().required(),
          },
        }
      }
    },
    {
      method: 'POST',
      path: '/user/profile',
      handler: controller.profileFormHandler,
      config: {
        payload: {
          failAction: 'ignore', // set payload to null if picture is too large
          maxBytes: 1048576, // 1MiB
          output: 'stream',
          parse: true,
          allow: 'multipart/form-data',
        },
        auth: {
          strategy: 'access_token',
          scope: 'profile',
        },
        validate: {
          failAction: controller.profileFormHandler,
          query: {
            client_id: Joi.string().required(),
            access_token: Joi.string().required(),
            redirect_uri: Joi.string().required(),
          },
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
      handler : controller.getResetPasswordForm,
      config : {
        validate : {
          failAction : controller.getResetPasswordForm,
          query : Object.assign({
            token: Joi.string().required(),
          }, queryValidation),
        },
      },
    },
    {
      method : 'POST',
      path : '/user/reset-password',
      handler : controller.postResetPasswordForm,
      config : {
        validate : {
          payload : {
            password : Joi.string().min(8).required(),
            pass2 : Joi.any().valid(Joi.ref('password')).required(),
          },
          query : Object.assign({
            token: Joi.string().required(),
          }, queryValidation),
          failAction : controller.getResetPasswordForm,
        }
      },
    },
    {
      method: 'GET',
      path: '/user/accept-invite',
      handler: controller.getAcceptInviteForm,
      config: {
        validate: {
          query: {
            token: Joi.string().guid().required(),
          },
        },
      },
    },
    {
      method: 'POST',
      path: '/user/accept-invite',
      handler: controller.postAcceptInviteForm,
      config: {
        validate: {
          payload : {
            password : Joi.string().min(8).required(),
            pass2 : Joi.any().valid(Joi.ref('password')).required(),
          }, 
          query: {
            token: Joi.string().guid().required(),
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
  'user/user-form-data',
];
