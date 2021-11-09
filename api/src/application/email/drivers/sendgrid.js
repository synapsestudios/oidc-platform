const sgMail = require('@sendgrid/mail');

const checkWhitelist = require('../check-whitelist');
const logger = require('../../../lib/logger');
const Boom = require('boom');
const config = require('../../../../config');

module.exports = function () {
  sgMail.setApiKey(config('/email/sendGridApiKey'));

  return {
    send: (emailObject) => {

      return new Promise((resolve, reject) => {
        if (!emailObject.to) {
          return reject(new Error('no to address provided'));
        }
  
        if (!emailObject.subject) {
          return reject(new Error('no subject provided'));
        }
  
        if (!emailObject.text && !emailObject.html) {
          return reject(new Error('no text or html body provided'));
        }

        let whitelistError = false;
        const to = checkWhitelist(emailObject.to, err => whitelistError = err);
        if (whitelistError) {
          return reject(new Error(whitelistError));
        }

        const mail = {
          from: emailObject.from || 'no-reply@' + config('/email/domain'),
          to,
          subject: emailObject.subject,
          text: emailObject.text || ' ',
          html: emailObject.html || ' '
        };

        if (emailObject.attachments) {
          if (!Array.isArray(emailObject.attachments)) {
            return reject(new Error('attachments must be an array'));
          }

          mail.attachments = emailObject.attachments.map(attachment => ({
            type: attachment.contentType,
            filename: attachment.filename,
            content:
              typeof attachment.data === 'string'
                ? new Buffer(attachment.data)
                : attachment.data,
            disposition: 'attachment',
            contentId: '',
          }));
        }

        sgMail.send(mail, (error, body) => {
          if(error) {
            logger.error(error);

          if (error.response) {
            logger.error(error.response.body);
          }

          return reject(Boom.wrap(error, error.statusCode));

          } else {
            resolve(body);
          }
        });
      });
    }
  };
};
