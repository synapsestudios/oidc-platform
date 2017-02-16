const Joi = require('joi');

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
      config : {
        validate : {
          failAction : controller.registerFormHandler,
          query : queryValidation,
        }
      },
      handler : controller.registerFormHandler
    },
    {
      method : 'POST',
      path : '/user/register',
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
      handler : controller.registerFormHandler,
    },
    {
      method: 'GET',
      path: '/user/profile',
      handler: controller.profileFormHandler,
      config: {
        validate: {
          query: {
            clientId: Joi.string().required(),
            accessToken: Joi.string().required(),
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
        validate: {
          failAction: controller.profileFormHandler,
          query: {
            clientId: Joi.string().required(),
            accessToken: Joi.string().required(),
            redirect_uri: Joi.string().required(),
          },
          payload: {
            name: Joi.string().allow(''),
            given_name: Joi.string().allow(''),
            family_name: Joi.string().allow(''),
            middle_name: Joi.string().allow(''),
            nickname: Joi.string().allow(''),
            preferred_username: Joi.string().allow(''),
            profile: Joi.string().uri().allow(''),
            picture: Joi.string().uri().allow(''),
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
          }
        }
      },
    },
    {
      method : 'GET',
      path : '/user/forgot-password',
      config : {
        validate : {
          failAction : controller.getForgotPasswordForm,
          query : queryValidation,
        },
      },
      handler : controller.getForgotPasswordForm,
    },
    {
      method : 'POST',
      path : '/user/forgot-password',
      config : {
        validate : {
          payload : {
            email : Joi.string().email().required(),
          },
          query : queryValidation,
          failAction : controller.getForgotPasswordForm,
        }
      },
      handler : controller.postForgotPasswordForm,
    },
    {
      method : 'GET',
      path : '/user/reset-password',
      config : {
        validate : {
          failAction : controller.getResetPasswordForm,
          query : Object.assign({
            token: Joi.string().required(),
          }, queryValidation),
        },
      },
      handler : controller.getResetPasswordForm,
    },
    {
      method : 'POST',
      path : '/user/reset-password',
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
      handler : controller.postResetPasswordForm,
    },
  ];
};

module.exports['@singleton'] = true;
module.exports['@require'] = [
  'user/user-service',
  'user/user-controller',
  'user/user-form-data',
];
