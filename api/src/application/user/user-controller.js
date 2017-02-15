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
    },
    profile: {
      'string.uri': 'Must be a valid URL',
    },
    picture: {
      'string.uri': 'Must be a valid URL',
    },
    website: {
      'string.uri': 'Must be a valid URL',
    }
  };

  const handleRegistrationPost = function(request, reply) {
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

  const handleProfilePost = function(user, request, reply) {
    const profile = user.get('profile');
    Object.assign(profile, request.payload);
    return user.save({ profile }).then(() => {
      return reply();
    });
  };

  return {
    registerFormHandler: function(request, reply, source, error) {
      request.payload = request.payload || {};
      var validationErrorMessages = {};

      if (!error && request.method === 'post') {
        handleRegistrationPost(request, reply);
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

    profileFormHandler: function(request, reply, source, error) {
      const redisAdapter = new RedisAdapter('AccessToken');
      redisAdapter.find(request.query.accessToken.substr(0, 48)).then(token => {
        if (token) {
          if (token.signature !== request.query.accessToken.substr(48)) {
            // @todo redirect with error in query string
            return reply(Boom.forbidden());
          }
          const payload = JSON.parse(atob(token.payload));
          const accountId = payload.accountId;
          service.findById(accountId).then(user => {
            if (!user) {
              // @todo redirect with error in query string
              return reply(Boom.notFound());
            }

            const validationErrorMessages = {};
            if (!error && request.method === 'post') {
              return handleProfilePost(user, request, reply);
            } else {
              if (error) {
                error = formatError(error);
                error.output.payload.validationErrors.forEach(errorObj => {
                  validationErrorMessages[errorObj.key] = validationErrorMessages[errorObj.key] || [];
                  if (errorMessages[errorObj.key] && errorMessages[errorObj.key][errorObj.type]) {
                    validationErrorMessages[errorObj.key].push(errorMessages[errorObj.key][errorObj.type]);
                  } else {
                    validationErrorMessages[errorObj.key].push('Invalid value');
                  }
                });
              }
            }

            const profile = user.get('profile');
            const getValue = (field) => {
              return (request.payload && request.payload[field]) || get(profile, field, '');
            };
            reply.view('user-profile', {
              fields: [
                {
                  name: 'name',
                  label: 'Name',
                  type: 'text',
                  value: getValue('name'),
                  error: validationErrorMessages.name,
                },
                {
                  name: 'given_name',
                  label: 'Given Name',
                  type: 'text',
                  value: getValue('given_name'),
                  error: validationErrorMessages.given_name,
                },
                {
                  name: 'family_name',
                  label: 'Family Name',
                  type: 'text',
                  value: getValue('family_name'),
                  error: validationErrorMessages.family_name,
                },
                {
                  name: 'middle_name',
                  label: 'Middle Name',
                  type: 'text',
                  value: getValue('middle_name'),
                  error: validationErrorMessages.middle_name,
                },
                {
                  name: 'nickname',
                  label: 'Nickname',
                  type: 'text',
                  value: getValue('nickname'),
                  error: validationErrorMessages.nickname,
                },
                {
                  name: 'preferred_username',
                  label: 'Preferred Username',
                  type: 'text',
                  value: getValue('preferred_username'),
                  error: validationErrorMessages.preferred_username,
                },
                {
                  name: 'profile',
                  label: 'Profile',
                  type: 'text',
                  value: getValue('profile'),
                  error: validationErrorMessages.profile,
                },
                {
                  name: 'picture',
                  label: 'Picture',
                  type: 'text',
                  value: getValue('picture'),
                  error: validationErrorMessages.picture,
                },
                {
                  name: 'website',
                  label: 'Website',
                  type: 'text',
                  value: getValue('website'),
                  error: validationErrorMessages.website,
                },
                {
                  name: 'email',
                  label: 'Email',
                  type: 'text',
                  value: getValue('email'),
                  error: validationErrorMessages.email,
                },
                {
                  name: 'gender',
                  label: 'Gender',
                  type: 'text',
                  value: getValue('gender'),
                  error: validationErrorMessages.gender,
                },
                {
                  name: 'birthdate',
                  label: 'Birthdate',
                  type: 'text',
                  value: getValue('birthdate'),
                  error: validationErrorMessages.birthdate,
                },
                {
                  name: 'zoneinfo',
                  label: 'Timezone',
                  type: 'text',
                  value: getValue('zoneinfo'),
                  error: validationErrorMessages.zoneinfo,
                },
                {
                  name: 'locale',
                  label: 'Locale',
                  type: 'text',
                  value: getValue('locale'),
                  error: validationErrorMessages.locale,
                },
                {
                  name: 'phone_number',
                  label: 'Phone Number',
                  type: 'text',
                  value: getValue('phone_number'),
                  error: validationErrorMessages.phone_number,
                },
                {
                  name: 'address.street_address',
                  label: 'Street Address',
                  type: 'text',
                  value: getValue('address.street_address'),
                  error: validationErrorMessages['address.street_address'],
                },
                {
                  name: 'address.locality',
                  label: 'Locality',
                  type: 'text',
                  value: getValue('address.locality'),
                  error: validationErrorMessages['address.locality'],
                },
                {
                  name: 'address.region',
                  label: 'Region',
                  type: 'text',
                  value: getValue('address.region'),
                  error: validationErrorMessages['address.region'],
                },
                {
                  name: 'address.postal_code',
                  label: 'Postal Code',
                  type: 'text',
                  value: getValue('address.postal_code'),
                  error: validationErrorMessages['address.postal_code'],
                },
                {
                  name: 'address.country',
                  label: 'Country',
                  type: 'text',
                  value: getValue('address.country'),
                  error: validationErrorMessages['address.country'],
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
