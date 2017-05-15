const Wreck = require('wreck');
const boom = require('boom');
const btoa = require('btoa');

const wreck = Wreck.defaults({
  baseUrl: 'http://localhost:9000',
  json: true,
});

const clientId = 'd2044c3e-a900-4df6-adc8-2256c549257f';
const clientSecret = 'wiitf5GNnZfc0k++HRc1HagwivJ3nl05l1JGev7HSuPS1laq5jCDA5XBTnBLBW5C';
const scope = 'openid email app_metadata profile';

let token = '';

function getAccessToken(){
  return new Promise((resolve, reject) => {
    if (token == '') {
      wreck.post('/op/token', {
        payload: `grant_type=client_credentials&scope=admin`,
        headers: {
          Authorization: 'Basic ' + btoa(`${clientId}:${clientSecret}`),
          'Content-Type': 'application/x-www-form-urlencoded'
        },
      }, (error, response, payload) => {
        if (error) {
          reject(error);
        } else {
          token = payload.access_token;
          resolve(token);
        }
      });
    } else {
      resolve(token);
    }
  });
}

module.exports = (request, reply) => {
  const options = {};
  options.payload = {};
  options.payload.email = request.payload.email;
  options.payload.client_id = clientId;
  options.payload.scope = scope;
  options.payload.app_name = 'Test Client';
  options.headers = {};
  getAccessToken().then(tkn => {
    options.headers.Authorization = `Bearer ${tkn}`;
    wreck.post('/api/invite', options, (error, response, payload) => {
      if (error) {
        console.log(error);
        reply(error);
      } else {
        console.log('success: ', payload);
        reply(payload);
      }
    });
  }).catch(error => {
    reply(error);
  });
}