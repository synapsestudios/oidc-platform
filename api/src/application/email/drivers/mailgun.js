'use strict';

const Mailgun = require('mailgun-js');
const checkWhitelist = require('../check-whitelist');

module.exports = function () {

  const mailgunClient = Mailgun({
    apiKey: process.env.MAILGUN_API_KEY,
    domain: process.env.OIDC_EMAIL_DOMAIN,
  });

  return {
    send : (emailObject) => {

      return new Promise((resolve, reject) => {

        if (!emailObject.to) {
          return reject('no to address provided');
        }

        if (!emailObject.subject) {
          return reject('no subject provided');
        }

        if (!emailObject.text && !emailObject.html) {
          return reject('no text or html body provided');
        }

        const mail = {
          from: emailObject.from || 'no-reply@' + process.env.OIDC_EMAIL_DOMAIN,
          to: checkWhitelist(emailObject.to, reject),
          subject: emailObject.subject,
          text: emailObject.text || '',
          html: emailObject.html || ''
        };

        if (emailObject.attachments) {
          if (!Array.isArray(emailObject.attachments)) {
            return reject('attachments must be an array');
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
            console.log(error, mail);
            reject(error);
          }
          else {
            resolve(body);
          }
        });
      });
    }
  };
};
