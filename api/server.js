const Glue = require('glue');
const ioc = require('electrolyte');
const handlebars = require('handlebars');
const manifestPromise = require('./manifest');

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
      });
  });
});
