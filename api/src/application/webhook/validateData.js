const Hoek = require('hoek');

module.exports = function validateData(data) {
  Hoek.assert(data.alg, new Error('webhook data must contain algorithm'));
  Hoek.assert(data.url, new Error('webhook data must contain url'));
  Hoek.assert(data.payload, new Error('webhook data must contain payload'));
  Hoek.assert(data.client_id, new Error('webhook data must contain client_id'));
}
