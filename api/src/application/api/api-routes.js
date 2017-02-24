const Joi = require('joi');

module.exports = (controller, mixedValidation, rowNotExists) => [
  {
    method: 'POST',
    path: '/api/invite',
    handler: controller.inviteUser,
    config: {
      auth: {
        strategy: 'jwt',
        scope: 'invite'
      },
      validate: {
        payload: mixedValidation(
          {
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
  'api/api-controller',
  'validator/mixed-validation',
  'validator/constraints/row-not-exists',
];
