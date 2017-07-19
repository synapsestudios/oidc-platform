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

module.exports = (request, reply) => {
  const options = {};
  options.payload = {};
  options.payload.email = request.payload.email;
  options.payload.client_id = clientId;
  options.payload.redirect_uri = 'https://sso-client.dev:3000/';
  options.payload.scope = scope;
  options.payload.app_name = 'Test Client';
  options.headers = {};
  if (request.payload.useTemplate) {
    options.payload.template = fs.readFileSync(path.join(__dirname, './templates/custom-email.hbs'), 'utf8');
  }
  getAccessToken().then(tkn => {
    options.headers.Authorization = `Bearer ${tkn}`;
    console.log('Submitting API request for user invite.');
    wreck.post('/api/invite', options, (error, response, payload) => {
      if (error) {
        console.log('Error while inviting user.');
        console.log(error);
        reply(error);
      } else {
        console.log('User invite successful.');
        reply(payload);
      }
    });
  }).catch(error => {
    reply(error);
  });
}
