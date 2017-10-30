const Hapi = require('hapi');
const Joi = require('joi');
const Boom = require('boom');

const inviteHandler = require('./inviteHandler');

const server = new Hapi.Server();

server.connection({ port: 8080 });

server.route({
  method: 'POST',
  path: '/invite',
  handler: inviteHandler,
  config: {
    validate: {
      payload: {
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        useTemplate: Joi.boolean(),
      }
    }
  }
});

server.route({
  method: 'POST',
  path: '/webhook',
  handler: (request, reply) => {
    console.log(request.payload);
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
      default:
        console.log('responding with 1 second delay');
        setTimeout(() => {
          reply(request.payload);
        }, 1000);
    }
  },
});

server.start((err) => {
  if (err) {
    throw err;
  }

  console.log(`Server running at: ${server.info.uri}`);
});
