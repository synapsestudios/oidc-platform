const config = require('../../../config');
const base = config('/baseUrl');
const querystring = require('querystring');
const Hoek = require('hoek');
const userViews = require('./user-views');
const handlebars = require('handlebars');

module.exports = (emailService, themeService, renderTemplate, emailTokenService) => {
  return {
    async sendChangeEmailVerifyEmail(email, query, user, client) {
      const token = await emailTokenService.create(user.get('id'));

      const viewContext = {
        url: `${base}/user/complete-email-update?${querystring.stringify({
          client_id: query.client_id,
          redirect_uri: query.redirect_uri,
          token: token.get('token')})}`,
        appName: client.get('client_name'),
      };

      let template = await themeService.renderThemedTemplate(query.client_id, 'change-email-verify-email', viewContext);

      if (!template) {
        template = await renderTemplate('change-email-verify-email', viewContext, {
          layout: 'email',
        });
      }

      await emailService.send({
        to: email,
        subject: 'Verify your new email address',
        html: template,
      });
    },

    async sendChangeEmailAlertEmail(email, client) {
      const viewContext = {
        appName: client.get('client_name'),
      };

      let template = await themeService.renderThemedTemplate(client.get('client_id'), 'change-email-alert-email', viewContext);

      if (!template) {
        template = await renderTemplate('change-email-alert-email', viewContext, {
          layout: 'email',
        });
      }

      await emailService.send({
        to: email,
        subject: 'Email Updated',
        html: template,
      });
    },

    async sendVerificationEmail(email, query, user, client) {
      const token = await emailTokenService.create(user.get('id'));

      const viewContext = {
        url: `${base}/user/email-verify?${querystring.stringify({
          client_id: query.client_id,
          redirect_uri: query.redirect_uri,
          token: token.get('token')})}`,
        appName: client.get('client_name'),
      };

      let template = await themeService.renderThemedTemplate(query.client_id, 'forgot-password-email', viewContext);

      if (!template) {
        template = await renderTemplate('email-verify-email', viewContext, {
          layout: 'email',
        });
      }

      await emailService.send({
        to: email,
        subject: 'Verify your email address',
        html: template,
      });
    },

    async sendPasswordChangeEmail(email, client) {
      let template = await themeService.renderThemedTemplate(client.get('client_id'), 'change-password-success-email', {
        appName: client.get('client_name'),
      });

      if (!template) {
        template = await renderTemplate('change-password-success-email', {
          appName: client.get('client_name'),
        }, {
          layout: 'email',
        });
      }

      emailService.send({
        to: email,
        subject: 'Password Changed',
        html: template,
      });
    },

    async sendForgotPasswordEmail(user, client, email, query) {
      const token = await emailTokenService.create(user.get('id'));
      const newQuery = querystring.stringify(Object.assign({}, query, { token: token.get('token') }));
      let template = await themeService.renderThemedTemplate(query.client_id, 'forgot-password-email', {
        url: `${base}/user/reset-password?${newQuery}`
      });

      if (!template) {
        template = await renderTemplate('forgot-password-email', {
          user: user.serialize(),
          client: client.serialize({strictOidc:true}),
          url: `${base}/user/reset-password?${newQuery}`,
        }, {
          layout: 'email',
        });
      }

      emailService.send({
        to: email,
        subject: 'Reset your password',
        html: template,
      });
    },

    async sendInviteEmail(user, client, hoursTilExpiration, templateOverride, query, saveOptions) {
      Hoek.assert(Hoek.contain(
        Object.keys(query),
        ['client_id', 'redirect_uri', 'scope', 'response_type'],
      ), new Error('query must contain client_id, redirect_uri, response_type, and scope'));

      const token = await emailTokenService.create(user.get('id'), hoursTilExpiration, saveOptions);
      const viewContext = userViews.inviteEmail(user, client, config('/baseUrl'), {...query, token: token.get('token')});
      let emailBody;

      if (templateOverride) {
        const emailTemplate = handlebars.compile(templateOverride);
        emailBody = emailTemplate(viewContext);
      } else {
        emailBody = await themeService.renderThemedTemplate(query.client_id, 'invite-email', viewContext);

        if (!emailBody) {
          emailBody = await renderTemplate('invite-email', viewContext, {
            layout: 'email',
          });
        }
      }

      return await emailService.send({
        to: user.get('email'),
        subject: `${client.get('client_name')} Invitation`,
        html: emailBody,
      });
    },

  };
};

module.exports['@singleton'] = true;
module.exports['@require'] = [
  'email/email-service',
  'theme/theme-service',
  'render-template',
  'email-token/email-token-service',
];
