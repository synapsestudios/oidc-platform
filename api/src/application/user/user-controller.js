const querystring = require('querystring');
const formatError = require('../../lib/format-error');
const atob = require('atob');
const Boom = require('boom');
const get = require('lodash/get');

module.exports = (service, RedisAdapter) => {

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
      const redisAdapter = new RedisAdapter('AccessToken');
      redisAdapter.find(request.query.accessToken.substr(0, 48)).then(token => {
        if (token) {
          if (token.signature !== request.query.accessToken.substr(48)) {
            return reply(Boom.forbidden());
          }
          const payload = JSON.parse(atob(token.payload));
          const accountId = payload.accountId;
          service.findById(accountId).then(user => {
            if (!user) {
              return reply(Boom.notFound());
            }
            const profile = user.claims();
            reply.view('user-profile', {
              fields: [
                {
                  name: 'name',
                  label: 'Name',
                  type: 'text',
                  value: get(profile, 'name', ''),
                },
                {
                  name: 'given_name',
                  label: 'Given Name',
                  type: 'text',
                  value: get(profile, 'given_name', ''),
                },
                {
                  name: 'family_name',
                  label: 'Family Name',
                  type: 'text',
                  value: get(profile, 'family_name', ''),
                },
                {
                  name: 'middle_name',
                  label: 'Middle Name',
                  type: 'text',
                  value: get(profile, 'middle_name', ''),
                },
                {
                  name: 'nickname',
                  label: 'Nickname',
                  type: 'text',
                  value: get(profile, 'nickname', ''),
                },
                {
                  name: 'preferred_username',
                  label: 'Preferred Username',
                  type: 'text',
                  value: get(profile, 'preferred_username', ''),
                },
                {
                  name: 'profile',
                  label: 'Profile',
                  type: 'text',
                  value: get(profile, 'profile', ''),
                },
                {
                  name: 'picture',
                  label: 'Picture',
                  type: 'text',
                  value: get(profile, 'picture', ''),
                },
                {
                  name: 'website',
                  label: 'Website',
                  type: 'text',
                  value: get(profile, 'website', ''),
                },
                {
                  name: 'email',
                  label: 'Email',
                  type: 'text',
                  value: get(profile, 'email', ''),
                },
                {
                  name: 'gender',
                  label: 'Gender',
                  type: 'text',
                  value: get(profile, 'gender', ''),
                },
                {
                  name: 'birthdate',
                  label: 'Birthdate',
                  type: 'text',
                  value: get(profile, 'birthdate', ''),
                },
                {
                  name: 'zoneinfo',
                  label: 'Timezone',
                  type: 'text',
                  value: get(profile, 'zoneinfo', ''),
                },
                {
                  name: 'locale',
                  label: 'Locale',
                  type: 'text',
                  value: get(profile, 'locale', ''),
                },
                {
                  name: 'phone_number',
                  label: 'Phone Number',
                  type: 'text',
                  value: get(profile, 'phone_number', ''),
                },
                {
                  name: 'address[street_address]',
                  label: 'Street Address',
                  type: 'text',
                  value: get(profile, 'address.street_address', ''),
                },
                {
                  name: 'address[locality]',
                  label: 'Locality',
                  type: 'text',
                  value: get(profile, 'address.locality', ''),
                },
                {
                  name: 'address[region]',
                  label: 'Region',
                  type: 'text',
                  value: get(profile, 'address.region', ''),
                },
                {
                  name: 'address[postal_code]',
                  label: 'Postal Code',
                  type: 'text',
                  value: get(profile, 'address.postal_code', ''),
                },
                {
                  name: 'address[country]',
                  label: 'Country',
                  type: 'text',
                  value: get(profile, 'address.country', ''),
                },
              ]
            });
          });
        } else {
          return reply(Boom.unauthorized());
        }
      });
    }
  };
};

module.exports['@singleton'] = true;
module.exports['@require'] = [
  'user/user-service',
  'oidc-adapter/redis',
];
