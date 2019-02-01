const Hapi = require('hapi');
const Joi = require('joi');

const {
  JWK: { asKeyStore },
  JWS: { createVerify },
} = require('node-jose');

const keys = require('../../api/keystore');


const inviteHandler = require('./inviteHandler');
const tokenHandler = require('./tokenHandler');
const webhookHandler = require('./webhookHandler');

const server = new Hapi.Server();
server.connection({
  port: 8080,
  routes: {
    cors: { origin: ['*'] }
  }
});

const validate = async (decoded, request, callback) => {
  try {
    const keystore = await asKeyStore(keys);
    let token = request.headers.authorization;
    token = token.replace('Bearer ', '');
    const result = await createVerify(keystore).verify(token);
    callback(null, result);
  } catch (e) {
    console.error(e);
    callback(null, false);
  }
}

server.register(require('hapi-auth-jwt2'), err => {
  server.auth.strategy('jwt', 'jwt', { verifyFunc: validate });

  server.route({
    method: 'POST',
    path: '/webhook',
    handler: webhookHandler,
    config: {
      auth: 'jwt',
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

server.route({
  method: 'POST',
  path: '/token',
  handler: tokenHandler,
});

server.start((err) => {
  if (err) {
    throw err;
  }

  console.log(`Server running at: ${server.info.uri}`);
});
