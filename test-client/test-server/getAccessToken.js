const Wreck = require('wreck');
const btoa = require('btoa');
const config = require('../src/config');

const wreck = Wreck.defaults({
  baseUrl: 'http://localhost:9001',
  json: true,
});

const clientId = config.clientId;
const clientSecret = config.clientSecret;

module.exports = () => {
  console.log('Getting Access Token for user invite.');
  return new Promise((resolve, reject) => {
    wreck.post('/op/token', {
      payload: `grant_type=client_credentials&scope=admin&scope=superadmin`,
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
