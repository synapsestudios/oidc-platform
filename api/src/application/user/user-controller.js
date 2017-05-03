const querystring = require('querystring');
const formatError = require('../../lib/format-error');
const get = require('lodash/get');
const set = require('lodash/set');
const uuid = require('uuid');
const config = require('../../../config');

module.exports = (
  userService,
  emailService,
  renderTemplate,
  clientService,
  userFormData,
  oidcProvider,
  imageService
) => {
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
    profile: {
      'string.uri': 'Must be a valid URL',
    },
    picture: {
      'string.uri': 'Must be a valid URL',
    },
    website: {
      'string.uri': 'Must be a valid URL',
    },
    birthdate: {
      'string.isoDate': 'Must be valid date in YYYY-MM-DD format'
    }
  };

  const handleRegistrationPost = function(request, reply) {
    userService.create(request.payload.email, request.payload.password)
      .then(user => {
        reply.redirect(`/op/auth?${querystring.stringify(request.query)}`);
      })
      .catch(error => {
        // assume email collision and show validation message
        reply.view('user-registration', {
          title: 'Sign Up',
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

        if (errorMessages[errorObj.key] && errorMessages[errorObj.key][errorObj.type]) {
          validationErrorMessages[errorObj.key].push(errorMessages[errorObj.key][errorObj.type]);
        } else if (errorObj.message) {
          validationErrorMessages[errorObj.key].push(errorObj.message);
        }
      });
    }

    return validationErrorMessages;
  };

  // e.g. convert { foo.bar: 'baz' } to { foo: { bar: 'baz' }}
  const expandDotPaths = function(object) {
    Object.keys(object).forEach(key => {
      if (key.indexOf('.') > -1) {
        const value = object[key];
        delete(object[key]);
        set(object, key, value);
      }
    });
    return object;
  };

  const getPasswordResetHandler = (method, title) => {
    if (method === 'GET') {
      return (request, reply, source, error) => {
        reply.view('reset-password', {
          title: title,
          returnTo: `${request.query.redirect_uri}?status=cancelled`,
          error: !!error,
          validationErrorMessages: getValidationMessages(error),
        });
      };
    } else if (method === 'POST') {
      return (request, reply) => {
        userService.findByPasswordToken(request.query.token)
        .then(user => {
          if (user) {
            return userService.encryptPassword(request.payload.password)
              .then(password => {
                const profile = user.get('profile');
                profile.email_verified = true;
                return userService.update(user.get('id'), { password, profile });
              })
              .then(() => userService.destroyPasswordToken(request.query.token))
              .then(() => reply.view(`reset-password-success`, {
                title: 'Reset Password',
              }));
          } else {
            return reply.view('reset-password', {
              title: title,
              returnTo: `${request.query.redirect_uri}?status=cancelled`,
              error: true,
              validationErrorMessages: { token: ['Token is invalid or expired'] },
            });
          }
        });
      };
    }
  };

  const self = {
    registerFormHandler: function(request, reply, source, error) {
      request.payload = request.payload || {};

      if (!error && request.method === 'post') {
        handleRegistrationPost(request, reply);
      } else {
        reply.view('user-registration', {
          title: 'Sign Up',
          formAction: `/user/register?${querystring.stringify(request.query)}`,
          returnTo: `${request.query.redirect_uri}?status=cancelled`,
          error: !!error,
          validationErrorMessages: getValidationMessages(error),
          email: request.payload.email || ''
        });
      }
    },

    profileFormHandler: function(request, reply, source, error) {
      const accountId = request.auth.credentials.accountId;
      userService.findById(accountId).then(user => {
        if (!user) {
          return reply.redirect(`${request.query.redirect_uri}?error=user_not_found&error_description=user not found`);
        }

        let validationErrorMessages = {};
        if (!error && request.method === 'post') {
          const profile = user.get('profile');
          const payload = expandDotPaths(request.payload);

          const oldPicture = profile.picture;
          const pictureMIME = request.payload.picture.hapi.headers['content-type'];

          return new Promise((resolve, reject) => {
            if (pictureMIME === 'image/jpeg' || pictureMIME === 'image/png') {
              const filename = uuid();
              const bucket = filename.substring(0, 2);
              imageService.uploadImageStream(request.payload.picture, `pictures/${bucket}/${filename}`)
                .then(filename => {
                  resolve(Object.assign(profile, payload, { picture: filename }));
                })
                .catch(err => {
                  reject(err);
                });
            } else {
              delete request.payload.picture;
              resolve(Object.assign(profile, payload));
            }
          })
            .then(profile => userService.update(user.get('id'), { profile }))
            .then(() => {
              if (oldPicture) {
                imageService.deleteImage(oldPicture.replace(/^.*\/\/[^\/]+\//, ''));
              }
            })
            .then(() => reply.redirect(request.query.redirect_uri));
        } else if (error) {
          validationErrorMessages = getValidationMessages(error);
          if (validationErrorMessages.picture || validationErrorMessages['hapi.headers.content-type']) {
            validationErrorMessages.picture = ['Must be JPEG or PNG image less than 1MB'];
          }
        }

        const profile = user.get('profile');
        const getValue = (field) => {
          return (request.payload && request.payload[field]) || get(profile, field, '');
        };
        reply.view('user-profile', {
          returnTo: request.query.redirect_uri,
          title: 'User Profile',
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
              isFile: true,
              accept: 'image/jpeg, image/png',
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
              isDropdown: true,
              options: userFormData.timezones.map(name => ({
                label: name,
                value: name,
                selected: getValue('zoneinfo') === name
              })),
              value: getValue('zoneinfo'),
              error: validationErrorMessages.zoneinfo,
            },
            {
              name: 'locale',
              label: 'Locale',
              isDropdown: true,
              options: Object.keys(userFormData.locales).map((value) => ({
                label: userFormData.locales[value],
                value,
                selected: getValue('locale') === value,
              })),
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
      return userService.findByEmailForOidc(request.payload.email)
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
          reply.view('forgot-password-success', {
            title: 'Forgot Password',
          });
        });
    },

    getResetPasswordForm: getPasswordResetHandler('GET', 'Reset Password'),

    postResetPasswordForm: getPasswordResetHandler('POST', 'Reset Password'),

    getAcceptInviteForm: getPasswordResetHandler('GET', 'Set Password'),

    postAcceptInviteForm: getPasswordResetHandler('POST', 'Set Password'),
  };

  return self;
};

module.exports['@singleton'] = true;
module.exports['@require'] = [
  'user/user-service',
  'email/email-service',
  'render-template',
  'client/client-service',
  'user/user-form-data',
  'oidc-provider',
  'image/image-service',
];
