const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const checkWhitelist = require('../check-whitelist');
const logger = require('../../../lib/logger');

module.exports = function () {

  return {
    send: async (emailObject) => {
      if (!emailObject.to) {
        throw 'no to address provided';
      }

      if (!emailObject.subject) {
        throw 'no subject provided';
      }

      if (!emailObject.text && !emailObject.html) {
        throw 'no text or html body provided';
      }

      let whitelistError = false;
      const to = checkWhitelist(emailObject.to, err => whitelistError = err);
      if (whitelistError) {
        throw whitelistError;
      }

      const mail = {
        from: emailObject.from || 'no-reply@' + process.env.OIDC_EMAIL_DOMAIN,
        to,
        subject: emailObject.subject,
        text: emailObject.text || ' ',
        html: emailObject.html || ' '
      };

      if (emailObject.attachments) {
        if (!Array.isArray(emailObject.attachments)) {
          throw 'attachments must be an array';
        }

        const attachments = [];
        emailObject.attachments.forEach((attachment) => {

          if (typeof attachment.data === 'string') {
            attachment.content = new Buffer(attachment.data);
          }

          attachments.push(new mailgunClient.Attachment({
            type: attachment.contentType,
            filename: attachment.filename,
            content: attachment.data,
            disposition: 'attachment',
            contentId: '',
          }));
        });
        mail.attachments = attachments;
      }

      try {
        const response = await sgMail.send(mail);
        return response;
      } catch (error) {
        logger.error(error);

        if (error.response) {
          logger.error(error.response.body)
        }

        throw error;
      }
    }
  };
};
