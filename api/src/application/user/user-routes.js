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
      config: {
        validate: {
          query: {
            accessToken: Joi.string().required(),
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
            zoneinfo: Joi.string().allow(''),
            locale: Joi.string().allow(''),
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
  ];
};

module.exports['@singleton'] = true;
module.exports['@require'] = ['user/user-service', 'user/user-controller', 'user/user-model'];
