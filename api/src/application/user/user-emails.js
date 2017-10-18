const config = require('../../../config');
const base = config('/baseUrl');

module.exports = (emailService, themeService, renderTemplate) => {
  return {
    async sendVerificationEmail(email, query, client) {
      const viewContext = {
        url: `${base}/user/email-verify`,
        appName: client.get('client_name'),
      };

      let template = await themeService.renderThemedTemplate(query.client_id, 'forgot-password-email', viewContext);

      if (!template) {
        template = await renderTemplate('email-verify-email', viewContext, {
          layout: 'email',
        });
      }

      emailService.send({
        to: email,
        subject: 'Verify your email address',
        html: template,
      });
    },
  };
};

module.exports['@singleton'] = true;
module.exports['@require'] = [
  'email/email-service',
  'theme/theme-service',
  'render-template',
];
