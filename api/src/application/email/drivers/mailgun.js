'use strict';

const Mailgun = require('mailgun-js');
const checkWhitelist = require('../check-whitelist');
const logger = require('../../../lib/logger');
const Boom = require('boom');
const config = require('../../../../config');

module.exports = function () {

  const mailgunClient = Mailgun({
    apiKey: config('/email/mailgunApiKey'),
    domain: config('/email/domain'),
  });

  return {
    send : (emailObject) => {

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

        const mail = {
          from: emailObject.from || 'no-reply@' + config('/email/domain'),
          to: checkWhitelist(emailObject.to, reject),
          subject: emailObject.subject,
          text: emailObject.text || '',
          html: emailObject.html || ''
        };

        if (emailObject.attachments) {
          if (!Array.isArray(emailObject.attachments)) {
            return reject(new Error('attachments must be an array'));
          }

          const attachments = [];
          emailObject.attachments.forEach((attachment) => {

            if (typeof attachment.data === 'string') {
              attachment.data = new Buffer(attachment.data);
            }

            attachments.push(new mailgunClient.Attachment({
              contentType: attachment.contentType,
              filename: attachment.filename,
              data: attachment.data
            }));
            mail.attachment = attachments[0];
          });
        }

        mailgunClient.messages().send(mail, (error, body) => {
          if (error) {
            logger.error(error, mail);
            return reject(Boom.wrap(error, error.statusCode));
          }
          else {
            resolve(body);
          }
        });
      });
    },
    client: () => {
      return mailgunClient;
    }
  };
};
