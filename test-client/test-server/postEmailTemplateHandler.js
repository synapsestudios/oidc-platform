const Wreck = require('wreck');
const boom = require('boom');
const btoa = require('btoa');
const config = require('../src/config');
const fs = require('fs');
const path = require('path');
const getAccessToken = require('./getAccessToken');

const wreck = Wreck.defaults({
  baseUrl: 'http://localhost:9000',
  json: true,
});

const clientId = config.clientId;
const clientSecret = config.clientSecret;
const scope = 'openid email app_metadata profile';

const template = `
  <div> Test Client reset password</div>
  <a href='{{{url}}}'>Click here to reset your password </a>
`;

module.exports = (request, reply) => {
  const options = {
    payload: {
      template : template,
      client_id : clientId,
    },
    headers: {},
  };

  getAccessToken().then(tkn => {
    options.headers.Authorization = `Bearer ${tkn}`;

    console.log('Posting new email template to API.');

    wreck.post('/api/reset-password-templates', options, (error, response, payload) => {
      if (error) {
        console.log('Error while posting email template.');
        console.log(error);
        reply(error);
      } else {
        console.log('Template post successful.');
        reply(payload);
      }
    });
  }).catch(error => {
    reply(error);
  });
}
