const Hapi = require('hapi');
const Joi = require('joi');
const Boom = require('boom');
const config = require('../src/config');

const inviteHandler = require('./inviteHandler');
const webhookHandler = require('./webhookHandler');

const server = new Hapi.Server();
server.connection({ port: 8080 });

const validate = (request, username, password, callback) => {
  if (username === config.clientId && password === config.clientSecret) {
    callback(null, true, { clientId: username, clientSecret: password });
  } else {
    console.log(config);
    callback(Boom.forbidden());
  }
}

server.register(require('hapi-auth-basic'), err => {
  server.auth.strategy('simple', 'basic', { validateFunc: validate });

  server.route({
    method: 'POST',
    path: '/webhook',
    handler: webhookHandler,
    config: {
      auth: 'simple',
    }
  });
});


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

server.start((err) => {
  if (err) {
    throw err;
  }

  console.log(`Server running at: ${server.info.uri}`);
});
