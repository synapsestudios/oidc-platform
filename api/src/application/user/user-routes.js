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
    {
      method: 'GET',
      path: '/user/profile',
      handler: controller.profileFormHandler,
    },
    {
      method: 'POST',
      path: '/user/profile',
      handler: controller.profileFormHandler,
      config: {
        validate: {
          payload: {
            name: Joi.string(),
            given_name: Joi.string(),
            family_name: Joi.string(),
            middle_name: Joi.string(),
            nickname: Joi.string(),
            preferred_username: Joi.string(),
            profile: Joi.string().uri(),
            picture: Joi.string().uri(),
            website: Joi.string().uri(),
            email: Joi.string().email(),
            gender: Joi.string(),
            birthdate: Joi.date().iso(),
            zoneinfo: Joi.string(),
            locale: Joi.string(),
            phone_number: Joi.string(),
            address: {
              street_address: Joi.string(),
              locality: Joi.string(),
              region: Joi.string(),
              postal_code: Joi.string(),
              country: Joi.string(),
            }
          }
        }
      },
    },
  ];
};

module.exports['@singleton'] = true;
module.exports['@require'] = ['user/user-service', 'user/user-controller', 'user/user-model'];
