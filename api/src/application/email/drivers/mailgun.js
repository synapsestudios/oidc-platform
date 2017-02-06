'use strict';

const _ = require('lodash');
const Mailgun = require('mailgun-js');

module.exports = function () {

  const mailgunClient = Mailgun({
    apiKey: process.env.MAILGUN_API_KEY,
    domain: process.env.MAILGUN_DOMAIN,
  });

  const options = {
    trap: process.env.MAILGUN_TRAP,
    whitelist: process.env.MAILGUN_WHITELIST ? process.env.MAILGUN_WHITELIST.split(',') : null,
  };

  const checkWhitelist = (emailAddress, reject) => {

    if (!options.whitelist || !options.whitelist.length) {
      return emailAddress;
    }

    const domainPattern = /@(.*)$/;
    const domain = emailAddress.match(domainPattern)[1];

    if (_.findIndex(options.whitelist, (whitelisted) => domain === whitelisted) >= 0) {
      return emailAddress;
    }

    if (!options.trap) {
      reject('trap option must be set if using whitelist');
    }
    else {
      return options.trap;
    }
  };

  return {
    send : (emailObject) => {

      return new Promise((resolve, reject) => {

        if (!emailObject.to) {
          return reject('no to address provided');
        }

        if (!emailObject.from) {
          return reject('no from address provided');
        }

        if (!emailObject.subject) {
          return reject('no subject provided');
        }

        if (!emailObject.text && !emailObject.html) {
          return reject('no text or html body provided');
        }

        const mail = {
          from: emailObject.from,
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
