const Joi = require('joi');

module.exports = (service, mixedValidation, rowNotExists) => [
  {
    method: 'POST',
    path: '/api/invite',
    handler: (request, reply) => {
      reply(service.inviteUser(request.payload));
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
          },
          {
            email: rowNotExists('user', 'email', 'Email already in use')
          }
        )
      }
    }
  }
];

module.exports['@singleton'] = true;
module.exports['@require'] = [
  'user/user-service',
  'validator/mixed-validation',
  'validator/constraints/row-not-exists',
];
