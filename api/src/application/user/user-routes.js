const Joi = require('joi');

const queryValidation = {
  client_id : Joi.string().required(),
  response_type : Joi.string().required(),
  scope : Joi.string().required(),
  redirect_uri : Joi.string().required(),
  nonce : Joi.string().optional(),
};

module.exports = (service, controller) => {
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
  'user/user-model',
  'user/user-password-reset-token-model',
];
