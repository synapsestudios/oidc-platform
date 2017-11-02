const Boom = require('boom');

module.exports = (request, reply) => {
  const random = Math.floor(Math.random() * 100);
  switch (true) {
    case (random < 5):
      console.log('responding with 5xx');
      reply(Boom.badImplementation());
      break;
    case (random >= 5 && random < 10):
      console.log('responding with 4xx');
      reply(Boom.forbidden());
      break;
    case (random >= 10 && random < 20):
      console.log('responding with 10 second delay');
      setTimeout(() => {
        reply(request.payload);
      }, 10000);
      break;
    default:
      console.log('responding with 1 second delay');
      setTimeout(() => {
        reply(request.payload);
      }, 1000);
  }
};
