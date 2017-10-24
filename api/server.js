const Glue = require('glue');
const ioc = require('electrolyte');
const handlebars = require('handlebars');
const manifestPromise = require('./manifest');
const bookshelf = require('./src/lib/bookshelf')();

var options = {
  relativeTo: __dirname + '/src'
};

manifestPromise.then(manifest => {
  Glue.compose(manifest, options, function(err, server) {
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

        if (!token) {
          token = await bookshelf.model('user_password_reset_token')
            .forge({ token })
            .where('expires_at', '>', bookshelf.knex.fn.now())
            .fetch();
        }
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
    return Promise.all([
      ioc.create('api/api-routes'),
      ioc.create('client/client-routes'),
      ioc.create('user/user-routes'),
    ])
      .then(routes => {
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
            console.log('Server running at:', server.info.uri);
          });
        } catch (e) {
          console.log(e);
        }
      })
      .catch(e => {
        server.log(['error'], e);
      });
  });
});
