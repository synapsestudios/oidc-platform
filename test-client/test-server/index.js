const Hapi = require('hapi');
const Joi = require('joi');

const inviteHandler = require('./inviteHandler');
const postEmailTemplateHandler = require('./postEmailTemplateHandler');

const server = new Hapi.Server();

server.connection({ port: 8080, host: 'localhost' });

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
  method: 'GET',
  path: '/test-email-template-post',
  handler: postEmailTemplateHandler,
});

server.start((err) => {
  if (err) {
    throw err;
  }

  console.log(`Server running at: ${server.info.uri}`);
});
