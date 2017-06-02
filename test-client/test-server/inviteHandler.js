const Wreck = require('wreck');
const boom = require('boom');
const btoa = require('btoa');
const config = require('../src/config');

const wreck = Wreck.defaults({
  baseUrl: 'http://localhost:9000',
  json: true,
});

const clientId = config.clientId;
const clientSecret = config.clientSecret;
const scope = 'openid email app_metadata profile';

function getAccessToken(){
  console.log('Getting Access Token for user invite.');
  return new Promise((resolve, reject) => {
    wreck.post('/op/token', {
      payload: `grant_type=client_credentials&scope=admin`,
      headers: {
        Authorization: 'Basic ' + btoa(`${clientId}:${clientSecret}`),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
    }, (error, response, payload) => {
      if (error) {
        console.log('Error getting access token.');
        console.log(error);
        reject(error);
      } else {
        console.log('Access token granted.');
        token = payload.access_token;
        resolve(token);
      }
    });
  });
}

module.exports = (request, reply) => {
  const options = {};
  options.payload = {};
  options.payload.email = request.payload.email;
  options.payload.client_id = clientId;
  options.payload.redirect_uri = 'https://sso.dev:3000/';
  options.payload.scope = scope;
  options.payload.app_name = 'Test Client';
  options.headers = {};
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