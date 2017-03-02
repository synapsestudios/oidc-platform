module.exports = (server) => server.plugins['open-id-connect'].provider;

module.exports['@singleton'] = true;
module.exports['@require'] = ['server'];
