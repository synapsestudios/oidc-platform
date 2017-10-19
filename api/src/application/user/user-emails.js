const config = require('../../../config');
const base = config('/baseUrl');
const querystring = require('querystring');
const Hoek = require('hoek');
const userViews = require('./user-views');
const handlebars = require('handlebars');

module.exports = (emailService, themeService, renderTemplate, emailTokenService) => {
  return {
    async sendVerificationEmail(email, query, user, client) {
      const token = await emailTokenService.create(user.get('id'));

      const viewContext = {
        url: `${base}/user/email-verify?${querystring.stringify({...query, token: token.get('token')})}`,
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

    async sendForgotPasswordEmail(email, query, userId) {
      const token = await emailTokenService.create(userId);
      const newQuery = querystring.stringify(Object.assign({}, query, { token: token.get('token') }));
      let template = await themeService.renderThemedTemplate(query.client_id, 'forgot-password-email', {
        url: `${base}/user/reset-password?${newQuery}`
      });

      if (!template) {
        template = await renderTemplate('forgot-password-email', {
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

    async sendInviteEmail(user, appName, hoursTilExpiration, templateOverride, query) {
      Hoek.assert(Hoek.contain(
        Object.keys(query),
        ['client_id', 'redirect_uri', 'scope', 'response_type'],
      ), new Error('query must contain client_id, redirect_uri, response_type, and scope'));

      const token = await emailTokenService.create(user.get('id'), hoursTilExpiration);
      const viewContext = userViews.inviteEmail(appName, config('/baseUrl'), {...query, token: token.get('token')});
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
        subject: `${appName} Invitation`,
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
