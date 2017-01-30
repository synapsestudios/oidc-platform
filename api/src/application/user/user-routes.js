const Joi = require('joi');

const queryValidation = {
  client_id : Joi.string().required(),
  response_type : Joi.string().required(),
  scope : Joi.string().required(),
  redirect_uri : Joi.string().required(),
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
  ];
};

module.exports['@singleton'] = true;
module.exports['@require'] = ['user/user-service', 'user/user-controller', 'user/user-model'];
