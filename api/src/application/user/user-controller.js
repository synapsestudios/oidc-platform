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
    scope : {
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
    },

    profileFormHandler: function(request, reply) {
      reply.view('user-profile', {
        fields: [
          {
            name: 'name',
            label: 'Name',
            type: 'text'
          },
          {
            name: 'given_name',
            label: 'Given Name',
            type: 'text'
          },
          {
            name: 'family_name',
            label: 'Family Name',
            type: 'text'
          },
          {
            name: 'middle_name',
            label: 'Middle Name',
            type: 'text'
          },
          {
            name: 'nickname',
            label: 'Nickname',
            type: 'text'
          },
          {
            name: 'preferred_username',
            label: 'Preferred Username',
            type: 'text'
          },
          {
            name: 'profile',
            label: 'Profile',
            type: 'text'
          },
          {
            name: 'picture',
            label: 'Picture',
            type: 'text'
          },
          {
            name: 'website',
            label: 'Website',
            type: 'text'
          },
          {
            name: 'email',
            label: 'Email',
            type: 'text'
          },
          {
            name: 'gender',
            label: 'Gender',
            type: 'text'
          },
          {
            name: 'birthdate',
            label: 'Birthdate',
            type: 'text'
          },
          {
            name: 'zoneinfo',
            label: 'Timezone',
            type: 'text'
          },
          {
            name: 'locale',
            label: 'Locale',
            type: 'text'
          },
          {
            name: 'phone_number',
            label: 'Phone Number',
            type: 'text'
          },
          {
            name: 'address[street_address]',
            label: 'Street Address',
            type: 'text'
          },
          {
            name: 'address[locality]',
            label: 'Locality',
            type: 'text'
          },
          {
            name: 'address[region]',
            label: 'Region',
            type: 'text'
          },
          {
            name: 'address[postal_code]',
            label: 'Postal Code',
            type: 'text'
          },
          {
            name: 'address[country]',
            label: 'Country',
            type: 'text'
          },
        ]
      });
    }
  };
};

module.exports['@singleton'] = true;
module.exports['@require'] = ['user/user-service'];
