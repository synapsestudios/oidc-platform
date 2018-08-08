const config = require('../../../config');
const base = config('/baseUrl');
const querystring = require('querystring');
const Hoek = require('hoek');
const userViews = require('./user-views');
const handlebars = require('handlebars');

module.exports = (emailService, themeService, renderTemplate, emailTokenService) => {
  const renderAndSend = async (to, clientId, page, context) => {
    const {template, renderedTemplate} = await themeService.getThemedTemplate(clientId, page, context);

    let html,
      subject = context.subject;
    let from = context.from;
    if (!template) {
      html = await renderTemplate(page, context, {
        layout: 'email',
      });
    } else {
      html = renderedTemplate;
      subject = (template.get('options') && template.get('options').subject) || subject;
      from = (template.get('options') && template.get('options').from) || from || null;
    }

    await emailService.send({to, subject, html, from});
  };

  return {
    async sendChangeEmailVerifyEmail(user, client, email, query) {
      const hoursTilExpiration = client.get('hours_til_expiration');
      const token = await emailTokenService.create(user.get('id'), hoursTilExpiration);
      const { from, ...restQuery } = query;

      const viewContext = {
        url: `${base}/user/complete-email-update?${querystring.stringify({
          client_id: query.client_id,
          redirect_uri: query.redirect_uri,
          token: token.get('token'),
        })}`,
        appName: client.get('client_name'),
        user: user.serialize(),
        client: client.serialize({strictOidc: true}),
        subject: 'Email Updated',
        from,
      };

      await renderAndSend(email, query.client_id, 'change-email-verify-email', viewContext);
    },

    async sendChangeEmailAlertEmail(user, client, email, from) {
      const viewContext = {
        appName: client.get('client_name'),
        user: user.serialize(),
        client: client.serialize({strictOidc: true}),
        subject: 'Email Updated',
        from,
      };

      await renderAndSend(email, client.get('client_id'), 'change-email-alert-email', viewContext);
    },

    async sendVerificationEmail(user, client, email, query) {
      const hoursTilExpiration = client.get('hours_til_expiration');
      const token = await emailTokenService.create(user.get('id'), hoursTilExpiration);
      const {from, ...restQuery} = query;

      const viewContext = {
        url: `${base}/user/email-verify?${querystring.stringify({
          client_id: restQuery.client_id,
          redirect_uri: restQuery.redirect_uri,
          token: token.get('token'),
        })}`,
        appName: client.get('client_name'),
        user: user.serialize(),
        client: client.serialize({strictOidc: true}),
        subject: 'Verify your email address',
        from: from,
      };

      await renderAndSend(email, restQuery.client_id, 'email-verify-email', viewContext);
    },

    async sendPasswordChangeEmail(user, client, email) {
      const viewContext = {
        user: user.serialize(),
        client: client.serialize({strictOidc: true}),
        appName: client.get('client_name'),
        subject: 'Password Changed',
      };

      await renderAndSend(email, client.get('client_id'), 'change-password-success-email', viewContext);
    },

    async sendForgotPasswordEmail(user, client, email, query) {
      const hoursTilExpiration = client.get('hours_til_expiration');
      const token = await emailTokenService.create(user.get('id'), client.get('hours_til_expiration'));
      const newQuery = querystring.stringify(Object.assign({}, query, {token: token.get('token')}));
      const viewContext = {
        user: user.serialize(),
        client: client.serialize({strictOidc: true}),
        url: `${base}/user/reset-password?${newQuery}`,
        appName: client.get('client_name'),
        subject: 'Reset your password',
      };

      await renderAndSend(email, client.get('client_id'), 'forgot-password-email', viewContext);
    },

    async sendInviteEmail(user, client, hoursTilExpiration, templateOverride, query, saveOptions) {
      Hoek.assert(
        Hoek.contain(Object.keys(query), ['client_id', 'redirect_uri', 'scope', 'response_type']),
        new Error('query must contain client_id, redirect_uri, response_type, and scope')
      );

      const clientHoursTilExpiration = hoursTilExpiration ? hoursTilExpiration : client.get('hours_til_expiration');
      const token = await emailTokenService.create(user.get('id'), hoursTilExpiration, saveOptions);
      const viewContext = userViews.inviteEmail(user, client, config('/baseUrl'), {
        ...query,
        token: token.get('token'),
      });

      try {
        if (templateOverride) {
          const emailTemplate = handlebars.compile(templateOverride);
          const emailBody = emailTemplate(viewContext);
          await emailService.send({
            to: user.get('email'),
            subject: viewContext.subject,
            html: emailBody,
            from: viewContext.from || null,
          });
        } else {
          await renderAndSend(user.get('email'), client.get('client_id'), 'invite-email', viewContext);
        }
      } catch (err) {
        return err;
      }
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
