const Glue = require('glue');
const ioc = require('electrolyte');
const handlebars = require('handlebars');
const manifestPromise = require('./manifest');
const bookshelf = require('./src/lib/bookshelf');
const logger = require('./src/lib/logger');
const config = require('./config');

var options = {
  relativeTo: __dirname + '/src'
};


if ((!process.env.KEYSTORE || !process.env.KEYSTORE_BUCKET) && config.env === 'production') {
  const message = 'You are attempting to use the default development keystore in production which is not allowed. \n'
    + 'Please generate secure keys by following the instructions here '
    + 'https://github.com/synapsestudios/oidc-platform/blob/master/docs/installation.md#keystores \n'
    + 'The process is exiting...';

  logger.error(message);
  process.exit(1);
} else {
  manifestPromise.then(manifest => {
    Glue.compose(manifest, options, async function(err, server) {
      if (err) {
        throw err;
      }

      server.auth.strategy('access_token', 'access_token', { token_type: 'access_token' });
      server.auth.strategy('client_credentials', 'access_token', { token_type: 'client_credentials' });
      server.auth.strategy('oidc_session', 'oidc_session');
      server.auth.strategy('email_token', 'email_token', {
        findToken: async id => {
          let token = await bookshelf.model('email_token')
            .forge({ token: id })
            .where('expires_at', '>', bookshelf.knex.fn.now())
            .fetch();
          return token;
        },
        findUser: async(id) => {
          return await bookshelf.model('user').where({ id }).fetch();
        }
      });

      ioc.use(id => {
        if (id === 'server') {
          server['@literal'] = true;
          return server;
        }
      });

      // Configure templating engine for emails
      server.views({
        engines: {
          hbs: handlebars
        },
        relativeTo: __dirname,
        path: './templates',
        layoutPath: './templates/layout',
        layout: 'default',
      });

      // Register routes
      let routes;
      try {
        routes = [
          await ioc.create('api/api-routes'),
          await ioc.create('user/user-routes'),
        ];
      } catch(e) {
        server.log(['error'], e);
      }


      try {
        server.route([{
          method: 'GET',
          path: '/health-check',
          handler: (req, reply) => reply('all good'),
        }]);
        routes.forEach(routes => {
          server.route(routes);
        });

        server.start(function () {
          for (let i = 0; i < server.connections.length; i++) {
            const message = `${server.connections[i].info.protocol === 'https' ? 'SSL ' : ''}Server running at: ${server.connections[i].info.uri}`;
            server.log(['info'], message);
          }
        });
      } catch (e) {
        server.log(['error'], e);
      }
    });
  }).catch(e => {
    logger.error(e);
    process.exit(1);
  });
}

