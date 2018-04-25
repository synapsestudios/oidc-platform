const AWS = require('aws-sdk');
const ses = new AWS.SES({apiVersion: '2010-12-01'});
const checkWhitelist = require('../check-whitelist');
const Boom = require('boom');

class SesDriver {
  send(emailObject) {
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

      if (emailObject.attachments) {
        return reject(new Error('ses driver does not currently support attachments'));
      }

      const params = {
        Destination: { ToAddresses: [checkWhitelist(emailObject.to, reject)] },
        Message: {
          Body: {
            Html: {
              Data: emailObject.html
            },
          },
          Subject: {
            Data: emailObject.subject,
          },
        },
        Source: emailObject.from || 'no-reply@' + process.env.OIDC_EMAIL_DOMAIN,
      };

      ses.sendEmail(params).promise().then(result => {
        resolve(result);
      })
        .catch(err => {
          reject(Boom.wrap(err, err.statusCode));
        });
    });
  }
}

module.exports = SesDriver;
