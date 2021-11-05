const AWS = require('aws-sdk');
const checkWhitelist = require('../check-whitelist');
const Boom = require('boom');
const config = require('../../../../config');

class SesDriver {

  send(emailObject) {

    const ses = new AWS.SES({apiVersion: '2010-12-01'});
    
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
        Source: emailObject.from || 'no-reply@' + config('/email/domain'),
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
