var Glue = require('glue');
var ioc = require('electrolyte');
var handlebars = require('handlebars');
var manifestPromise = require('./manifest');
var config = require('./config');

var options = {
  relativeTo: __dirname + '/src'
};

manifestPromise.then(manifest => {
  Glue.compose(manifest, options, function(err, server) {
    if (err) {
      throw err;
    }

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

    // Configure route authentication
    server.auth.strategy('jwt', 'jwt', {
      key: config('/auth/secret'),
      validateFunc: ioc.create('auth/validateJWT'),
      verifyOptions: { algorithms: [ 'HS256' ] }
    });

    // Register models
    ioc.create('client/client-contact-model');
    ioc.create('client/client-default-acr-value-model');
    ioc.create('client/client-grant-model');
    ioc.create('client/client-model');
    ioc.create('client/client-post-logout-redirect-uri-model');
    ioc.create('client/client-redirect-uri-model');
    ioc.create('client/client-request-uri-model');
    ioc.create('client/client-response-type-model');
    ioc.create('user/user-model');
    ioc.create('user/user-password-reset-token-model');

    // Register routes
    Promise.all([
      ioc.create('client/client-routes'),
      ioc.create('user/user-routes'),
    ])
      .then(routes => {
        routes.forEach(routes => {
          server.route(routes);
        });

        server.start(function () {
          console.log('Server running at:', server.info.uri);
        });
      });
  });
});
