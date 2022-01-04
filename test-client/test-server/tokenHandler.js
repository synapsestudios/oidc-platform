const Wreck = require('wreck');
const btoa = require('btoa');
const config = require('../src/config');
const querystring = require('querystring');

const wreck = Wreck.defaults({
  baseUrl: 'http://localhost:9001',
  json: true,
});

const clientId = config.clientId;
const clientSecret = config.clientSecret;


module.exports = (request, reply) => {
  const payload = JSON.parse(request.payload);
  const options = {
    headers: {
      Authorization: 'Basic ' + btoa(`${encodeURIComponent(clientId)}:${encodeURIComponent(clientSecret)}`),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    payload : querystring.stringify(payload),
  };

  wreck.post('/op/token', options, (error, response, payload) => {
    if (error) {
      console.log('Error while getting token.');
      console.log(error);
      reply(error);
    } else {
      console.log('token POST successful');
      reply(payload);
    }
  });

}
