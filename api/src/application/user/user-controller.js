const querystring = require('querystring');
const formatError = require('../../lib/format-error');
const get = require('lodash/get');
const set = require('lodash/set');
const uuid = require('uuid');
const config = require('../../../config');
const Boom = require('boom');
const views = require('./user-views');
const errorMessages = require('./user-error-messages');
const userFormData = require('./user-form-data');

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

module.exports = (
  userService,
  emailService,
  imageService,
  themeService
) => {
  const self = {
    registerFormHandler: async function(request, reply, source, error) {
      request.payload = request.payload || {};
      let viewContext;

      if (!error && request.method === 'post') {
        try {
          const user = userService.create(request.payload.email, request.payload.password)
          reply.redirect(`/op/auth?${querystring.stringify(request.query)}`);
        } catch (error) {
          // assume email collision and show validation message
          viewContext = views.userRegistration(request, {email: ['That email address is already in use']});
        }
      } else {
        viewContext = views.userRegistration(request, error);
      }

      if (viewContext) {
        const template = await themeService.renderThemedTemplate(request.query.client_id, 'user-registration', viewContext);
        if (template) {
          reply(template);
        } else {
          reply.view('user-registration', viewContext);
        }
      }
    },

    profileFormHandler: async function(request, reply, source, error) {
      const accountId = request.auth.credentials.accountId;
      const user = await userService.findById(accountId);

      if (!user) {
        return reply.redirect(`${request.query.redirect_uri}?error=user_not_found&error_description=user not found`);
      }

      let validationErrorMessages = {};
      if (!error && request.method === 'post') {
        let profile = user.get('profile');
        const payload = expandDotPaths(request.payload);

        const oldPicture = profile.picture;
        const pictureMIME = request.payload.picture.hapi.headers['content-type'];

        if (pictureMIME === 'image/jpeg' || pictureMIME === 'image/png') {
          const uuid = uuid();
          const bucket = uuid.substring(0, 2);
          const filename = await imageService.uploadImageStream(request.payload.picture, `pictures/${bucket}/${filename}`);

          profile = Object.assign(profile, payload, { picture: filename });
        } else {
          delete request.payload.picture;
          profile = Object.assign(profile, payload);
        }

        await userService.update(user.get('id'), { profile });

        if (oldPicture) {
          await imageService.deleteImage(oldPicture.replace(/^.*\/\/[^\/]+\//, ''));
        }

        reply.redirect(request.query.redirect_uri)
      }

      const viewContext = views.userProfile(user, request, error);
      reply.view('user-profile', viewContext);
    },

    getForgotPasswordForm: function(request, reply, source, error) {
      const viewContext = views.forgotPassword(request, error);
      reply.view('forgot-password', viewContext);
    },

    postForgotPasswordForm: function(request, reply) {
      userService.findByEmailForOidc(request.payload.email)
        .then(user => {
          return user ? userService.createPasswordResetToken(user.accountId): null
        })
        .then(token => {
          if (token) {
            return userService.sendForgotPasswordEmail(request.query, token);
          }
        })
        .then(emailBody => {
          if (emailBody) {
            return emailService.send({
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
        })
        .catch(e => {
          reply(e);
        });
    },

    logout: function(request, reply, source, error) {
      const sessionId = request.state._session;

      if (!sessionId) {
        console.error('Session id cookie not present');
        throw Boom.notFound();
      }

      return userService.invalidateSession(sessionId)
        .then(() => reply.redirect(request.query.post_logout_redirect_uri))
    },

    getResetPasswordForm: title => (request, reply, source, error) => {
      const viewContext = views.resetPassword(request, error);
      reply.view('reset-password', redirectSet);
    },

    postResetPasswordForm: title => (request, reply) => {
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
              .then(() => {
                const viewContext = views.resetPasswordSuccess(request);
                reply.view('reset-password-success', viewContext);
              });
          } else {
            const viewContext = views.resetPassword(request, { token: ['Token is invalid or expired'] });
            reply.view('reset-password', viewContext);
          }
        });
    }
  };

  return self;
};

module.exports['@singleton'] = true;
module.exports['@require'] = [
  'user/user-service',
  'email/email-service',
  'image/image-service',
  'theme/theme-service',
];
