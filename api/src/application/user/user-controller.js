const querystring = require('querystring');
const formatError = require('../../lib/format-error');

module.exports = (service) => {

  const errorMessages = {
    email : {
      'any.empty' : 'Email address is required',
      'string.email' : 'Must be a valid email address',
    },
    password : {
      'any.empty' : 'Password is required',
      'string.min' : 'Password must be at least 8 characters',
    },
    pass2 : {
      'any.allowOnly' : 'Passwords must match'
    },

    redirect_uri : {
      'any.required' : 'Redirect URI is required',
    },
    client_id : {
      'any.required' : 'Client ID is required'
    },
    response_type : {
      'any.required' : 'Response type is required',
    },
    schope : {
      'any.required' : 'Scope is required',
    }
  };

  const handlePost = function(request, reply) {
    // http://localhost:9000/op/auth?client_id=acmf&response_type=code&scope=openid&redirect_uri=http://sso-client.dev:3000/
    service.create(request.payload.email, request.payload.password)
      .then(user => {
        reply.redirect(`/op/auth?${querystring.stringify(request.query)}`);
      })
      .catch(error => {
        // assume email collision and show validation message
        reply.view('user-registration', {
          formAction : `/user/register?${querystring.stringify(request.query)}`,
          returnTo : `${request.query.redirect_uri}?status=cancelled`,
          error : true,
          validationErrorMessages: {email : ['That email address is already in use']},
          email : request.payload.email || ''
        });
      });
  };

  return {
    registerFormHandler: function(request, reply, source, error) {
      request.payload = request.payload || {};
      var validationErrorMessages = {};

      if (!error && request.method === 'post') {
        handlePost(request, reply);
      } else {
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

        reply.view('user-registration', {
          formAction : `/user/register?${querystring.stringify(request.query)}`,
          returnTo : `${request.query.redirect_uri}?status=cancelled`,
          error : !!error,
          validationErrorMessages,
          email : request.payload.email || ''
        });
      }
    }
  };
};

module.exports['@singleton'] = true;
module.exports['@require'] = ['user/user-service'];
