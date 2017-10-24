const Boom = require('boom');

module.exports = server => async (value, options) => {
  const provider = server.plugins['open-id-connect'].provider;

  const client = await provider.Client.find(value);
  if (!client) throw Boom.notFound('Client not found');

  const redirectUri = options.context.values.redirect_uri;
  if (client.redirectUris.indexOf(redirectUri) < 0) throw Boom.forbidden('redirect_uri not in whitelist');

  return value;
}

module.exports['@singleton'] = true;
module.exports['@require'] = ['server'];

