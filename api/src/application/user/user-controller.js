const querystring = require('querystring');
const set = require('lodash/set');
const omit = require('lodash/omit');
const views = require('./user-views');
const comparePasswords = require('../../lib/comparePasswords');
const bookshelf = require('../../lib/bookshelf');
const webhookService = require('../webhook/webhook-service');
const logger = require('../../lib/logger');
const allowedImageMimes = require('../image/allowed-image-mimes');

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
  imageService,
  themeService,
  clientService,
  formHandler,
  userEmails,
  emailTokenService
) => {
  return {
    registerHandler: formHandler('user-registration', views.userRegistration, async (request, reply, user, client, render) => {
      const profile = omit(request.payload, ['email', 'password', 'pass2']);
      user = await userService.create(request.payload.email, request.payload.password, { profile });
      webhookService.trigger('user.registered', user);
      await userEmails.sendVerificationEmail(user, client, request.payload.email, request.query);
      reply.redirect(`/op/auth?${querystring.stringify(request.query)}`);
    }),

    emailSettingsHandler: formHandler('email-settings', views.emailSettings, async (request, reply, user, client, render) => {
      let error;
      const { current, email } = request.payload;
      switch(request.payload.action) {
        case 'reverify':
          await userEmails.sendVerificationEmail(user, client, email, request.query);
          break;
        case 'new_reverify':
          await userEmails.sendChangeEmailVerifyEmail(user, client, email, request.query);
          break;
        case 'cancel_new':
          await bookshelf.model('email_token').where({user_id:user.get('id')}).destroy()
          user.set('pending_email', null);
          user.set('pending_email_lower', null);

          await user.save();
          break;
        case 'change':
          const isAuthenticated = await comparePasswords(current, user);
          if (isAuthenticated) {
            user.set('pending_email', email);
            user.set('pending_email_lower', email.toLowerCase());
            await user.save();

            await Promise.all([
              userEmails.sendChangeEmailVerifyEmail(user, client, email, request.query),
              userEmails.sendChangeEmailAlertEmail(user,client, user.get('email')),
            ]);

          } else {
            error = { current: ['Password is incorrect'] };
          }
          break;
      }

      await render(error);
    }),

    changePasswordHandler: formHandler('change-password', views.changePassword, async (request, reply, user, client, render) => {
      const { current, password } = request.payload;
      const isAuthenticated = await comparePasswords(current, user);
      let error;

      if (isAuthenticated) {
        const hashedPassword = await userService.encryptPassword(password);
        await userService.update(user.get('id'), { password: hashedPassword });
        await userEmails.sendPasswordChangeEmail(user, client, user.get('email'));
      } else {
        error = { current: ['Password is incorrect'] };
      }
      await render(error);
    }),

    profileHandler: formHandler('user-profile', views.userProfile, async (request, reply, user, client) => {
      let profile = user.get('profile');
      const { shouldClearPicture, ...originalPayload } = request.payload;
      const payload = expandDotPaths(originalPayload);

      const uploadingNewPicture = !!originalPayload.picture._data.byteLength;
      const oldPicture = profile.picture;
      const pictureMIME = originalPayload.picture.hapi.headers['content-type'];

      if (uploadingNewPicture && allowedImageMimes.indexOf(pictureMIME) >= 0) {
        const uuid = user.get('id');
        const bucket = uuid.substring(0, 2);
        const filename = await imageService.uploadImageStream(originalPayload.picture, `pictures/${bucket}/${uuid}`);

        profile = Object.assign(profile, payload, { picture: filename });
      } else {
        delete originalPayload.picture;
        if (shouldClearPicture) {
          profile = Object.assign(profile, payload, {picture: null});
        } else {
          profile = Object.assign(profile, payload);
        }
      }

      user = await userService.update(user.get('id'), { profile });
      webhookService.trigger('user.update', user);

      if (shouldClearPicture) {
        await imageService.deleteImage(oldPicture.replace(/^.*\/\/[^\/]+\//, ''));
      }

      reply.redirect(request.query.redirect_uri)
    }),

    forgotPasswordHandler: formHandler('forgot-password', views.forgotPassword, async (request, reply, user, client, render) => {
      user = await userService.findByEmail(request.payload.email);

      if (user) {
        await userEmails.sendForgotPasswordEmail(user, client, request.payload.email, request.query);
      }

      const viewContext = views.forgotPasswordSuccess(client, request);
      const template = await themeService.renderThemedTemplate('forgot-password-success', viewContext, request.query.client_id);
      reply(template);
    }),

    completeEmailUpdateHandler: async (request, reply, source, error) => {
      const token = request.auth.credentials.token;
      const user = request.auth.credentials.user;
      const client = await clientService.findById(request.query.client_id);

      if (!error) {
        const userCollection = await bookshelf.model('user').where({email_lower: user.get('pending_email_lower')}).fetchAll();

        if (userCollection.length >= 1) {
          error = {email: ['Sorry that email address is already in use']};
        } else {
          let title = 'Email Verified';
          const profile = user.get('profile');
          profile.email_verified = true;
          user.set('email', user.get('pending_email'));
          user.set('email_lower', user.get('pending_email_lower'));
          user.set('pending_email', null);
          user.set('pending_email_lower', null);
          await user.save();

          webhookService.trigger('user.update', user);
          await token.destroy();
        }
      }

      const viewContext = views.completeChangePassword(user, client, request, error);

      const template = await themeService.renderThemedTemplate('email-verify-success', viewContext, request.query.client_id);
      return reply(template);
    },

    emailVerifySuccessHandler: async (request, reply, source, error) => {
      const token = request.auth.credentials.token;
      const user = request.auth.credentials.user;

      if (!error) {
        const profile = user.get('profile');
        profile.email_verified = true;
        await userService.update(user.get('id'), { profile });
        token.destroy();

        webhookService.trigger('user.update', user);
      }

      const client = await clientService.findById(request.query.client_id);
      const viewContext = views.emailVerifySuccess(user, client, request, error);

      const template = await themeService.renderThemedTemplate('email-verify-success', viewContext, request.query.client_id);
      reply(template);
    },

    resetPassword: async function(request, reply, user, client, render, isInviteAcceptance) {
      const token = request.auth.credentials.token;
      const password = await userService.encryptPassword(request.payload.password)
      const profile = user.get('profile');
      profile.email_verified = true;
      await userService.update(user.get('id'), { password, profile });
      await emailTokenService.destroyUserTokens(user.get('id'));

      if (isInviteAcceptance) {
        await user.refresh();
        webhookService.trigger('user.accept-invite', user);
      }

      const viewContext = views.resetPasswordSuccess(request);
      const template = await themeService.renderThemedTemplate('reset-password-success', viewContext, request.query.client_id);
      reply(template);
    },

    logout: function(request, reply) {
      const sessionId = request.state._session;

      if (!sessionId) {
        logger.warn('Logout attempt without session cookie present');
        reply.redirect(request.query.post_logout_redirect_uri);
      } else {
        userService.invalidateSession(sessionId)
          .then(() => reply.redirect(request.query.post_logout_redirect_uri))
          .catch(e => reply(e));
      }
    },

    invalidateUserSessions: function(request, reply) {
      userService.invalidateSessionByUserId(request.query.user_id)
        .then(reply)
        .catch(reply);
    },

  };
};

module.exports['@singleton'] = true;
module.exports['@require'] = [
  'user/user-service',
  'image/image-service',
  'theme/theme-service',
  'client/client-service',
  'form-handler',
  'user/user-emails',
  'email-token/email-token-service',
];
