module.exports = (server, enqueueEmail) => {
  return {
    get : (request, reply) => {
      reply('example get request succeeded');
    },
  };
};

module.exports['@singleton'] = true;
module.exports['@require'] = ['server'];
