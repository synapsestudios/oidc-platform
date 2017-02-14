const querystring = require('querystring');
const formatError = require('../../lib/format-error');
const config = require('../../../config');

module.exports = (userService, emailService, renderTemplate) => {

  const errorMessages = {
    email: {
      'any.required': 'Email address is required',
      'any.empty': 'Email address is required',
      'string.email': 'Must be a valid email address',
    },
    password: {
      'any.empty': 'Password is required',
      'string.min': 'Password must be at least 8 characters',
    },
    pass2: {
      'any.allowOnly': 'Passwords must match'
    },
    redirect_uri: {
      'any.required': 'Redirect URI is required',
    },
    client_id: {
      'any.required': 'Client ID is required'
    },
    response_type: {
      'any.required': 'Response type is required',
    },
    scope: {
      'any.required': 'Scope is required',
    },
    token: {
      'any.required': 'Token is required',
    },
  };

  const handlePost = function(request, reply) {
    // http://localhost:9000/op/auth?client_id=acmf&response_type=code&scope=openid&redirect_uri=http://sso-client.dev:3000/
    userService.create(request.payload.email, request.payload.password)
      .then(user => {
        reply.redirect(`/op/auth?${querystring.stringify(request.query)}`);
      })
      .catch(error => {
        // assume email collision and show validation message
        reply.view('user-registration', {
          title: 'Register',
          formAction: `/user/register?${querystring.stringify(request.query)}`,
          returnTo: `${request.query.redirect_uri}?status=cancelled`,
          error: true,
          validationErrorMessages: {email: ['That email address is already in use']},
          email: request.payload.email || ''
        });
      });
  };

  const getValidationMessages = function(error) {
    var validationErrorMessages = {};

    if (error) {
      error = formatError(error);
      error.output.payload.validationErrors.forEach(errorObj => {
        validationErrorMessages[errorObj.key] = validationErrorMessages[errorObj.key] || [];

        if (errorMessages[errorObj.key][errorObj.type]) {
          validationErrorMessages[errorObj.key].push(errorMessages[errorObj.key][errorObj.type]);
        } else {
          validationErrorMessages[errorObj.key].push(errorObj.message);
        }
      });
    }

    return validationErrorMessages;
  };

  return {
    registerFormHandler: function(request, reply, source, error) {
      request.payload = request.payload || {};

      if (!error && request.method === 'post') {
        handlePost(request, reply);
      } else {
        reply.view('user-registration', {
          title: 'Register',
          formAction: `/user/register?${querystring.stringify(request.query)}`,
          returnTo: `${request.query.redirect_uri}?status=cancelled`,
          error: !!error,
          validationErrorMessages: getValidationMessages(error),
          email: request.payload.email || ''
        });
      }
    },

    getForgotPasswordForm: function(request, reply, source, error) {
      reply.view('forgot-password', {
        title: 'Forgot Password',
        formAction: `/user/forgot-password?${querystring.stringify(request.query)}`,
        returnTo: `${request.query.redirect_uri}?status=cancelled`,
        error: !!error,
        validationErrorMessages: getValidationMessages(error),
      });
    },

    postForgotPasswordForm: function(request, reply) {
      return userService.findByEmail(request.payload.email)
        .then(user => user ? userService.createPasswordResetToken(user.accountId): null)
        .then(token => {
          if (token) {
            const base = config('/baseUrl');
            const prevQuery = querystring.stringify(request.query);

            return renderTemplate('email/forgot-password', {
              url: `${base}/user/reset-password?${prevQuery}&token=${token.get('token')}`,
            });
          }
        })
        .then(emailBody => {
          if (emailBody) {
            emailService.send({
              to: request.payload.email,
              subject: 'Reset your password',
              html: emailBody,
            });
          }
        })
        .then(() => {
          reply.view('forgot-password-success');
        });
    },

    getResetPasswordForm: function(request, reply, source, error) {
      reply.view('reset-password', {
        title: 'Reset Password',
        formAction: `/user/reset-password?${querystring.stringify(request.query)}`,
        returnTo: `${request.query.redirect_uri}?status=cancelled`,
        error: !!error,
        validationErrorMessages: getValidationMessages(error),
      });
    },

    postResetPasswordForm: function(request, reply, source, error) {
      return userService.findByPasswordToken(request.query.token)
        .then(user => {
          if (user) {
            return userService.encryptPassword(request.payload.password)
              .then(password => userService.update(user.accountId, { password }))
              .then(() => userService.destroyPasswordToken(request.query.token))
              .then(() => reply.view('reset-password-success'));
          } else {
            return reply.view('reset-password', {
              title: 'Reset Password',
              formAction: `/user/reset-password?${querystring.stringify(request.query)}`,
              returnTo: `${request.query.redirect_uri}?status=cancelled`,
              error: true,
              validationErrorMessages: { token: ['Token is invalid or expired'] },
            });
          }
        });
    },
  };
};

module.exports['@singleton'] = true;
module.exports['@require'] = ['user/user-service', 'email/email-service', 'render-template'];
