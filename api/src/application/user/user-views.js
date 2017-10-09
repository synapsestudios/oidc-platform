const querystring = require('querystring');
const formatError = require('../../lib/format-error');
const errorMessages = require('./user-error-messages');

const getValidationMessages = function(error) {
  var validationErrorMessages = {};

  if (error) {
    error = formatError(error);
    error.output.payload.validationErrors.forEach(errorObj => {
      validationErrorMessages[errorObj.key] = validationErrorMessages[errorObj.key] || [];

      if (errorMessages[errorObj.key] && errorMessages[errorObj.key][errorObj.type]) {
        validationErrorMessages[errorObj.key].push(errorMessages[errorObj.key][errorObj.type]);
      } else if (errorObj.message) {
        validationErrorMessages[errorObj.key].push(errorObj.message);
      }
    });
  }

  return validationErrorMessages;
};

module.exports = {
  userRegistration : (request, error) => ({
    title: 'Sign Up',
    formAction: `/user/register?${querystring.stringify(request.query)}`,
    returnTo: `${request.query.redirect_uri}?status=cancelled`,
    error: !!error,
    validationErrorMessages: error.isBoom ? getValidationMessages(error) : error,
    email: request.payload.email || ''
  }),
};
