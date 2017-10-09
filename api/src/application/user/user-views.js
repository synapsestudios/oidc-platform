const querystring = require('querystring');

module.exports = {
  userRegistration : request => ({
    title: 'Sign Up',
    formAction: `/user/register?${querystring.stringify(request.query)}`,
    returnTo: `${request.query.redirect_uri}?status=cancelled`,
    error: true,
    validationErrorMessages: {email: ['That email address is already in use']},
    email: request.payload.email || ''
  }),
};
