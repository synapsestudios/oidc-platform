const Glue = require('glue');
const ioc = require('electrolyte');
const manifestPromise = require('./manifest');
const bookshelf = require('./src/lib/bookshelf');
const logger = require('./src/lib/logger');

var options = {
  relativeTo: __dirname + '/src'
};

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
          const message = `${server.connections[i].info.protocol === 'https' ? 'SSL ' : ''}Server running at: ${server.connections[i].info.uri}`
          server.log(['info'], message);

          const keepAliveTimeout = process.env.KEEP_ALIVE_TIMEOUT || 60;

          // keep tcp connections open a bit longer than the load balancer's timeout to prevent hangups that cause 502s
          server.connections[i].listener.keepAliveTimeout = (keepAliveTimeout * 1000) + 5000;
          // headersTimeout timer starts _after_ keep-alive timer has started so give it a 1 second buffer to prevent hangups
          server.connections[i].listener.headersTimeout = (keepAliveTimeout * 1000) + 6000;
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
