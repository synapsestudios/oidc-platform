const Glue = require('glue');
const ioc = require('electrolyte');
const handlebars = require('handlebars');
const manifestPromise = require('./manifest');
const jose = require('node-jose');
const fetchKeystores = require('./src/lib/fetch-keystores');

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

    fetchKeystores()
      .then(keystores => {
        return jose.JWK.asKeyStore(keystores.certificates);
      })
      .then(keystore => {
        ioc.create('auth/verifyJWT').then(verifyJWT => {
          // Configure route authentication
          server.auth.strategy('jwt', 'jwt', {
            verifyFunc: verifyJWT(keystore),
          });

          // Register routes
          return Promise.all([
            ioc.create('api/api-routes'),
            ioc.create('client/client-routes'),
            ioc.create('user/user-routes'),
          ])
            .then(routes => {
              try {
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
      }).catch(e => console.log(e));

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
  });
});
