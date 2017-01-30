var ioc = require('electrolyte');
var config = require('./config');
var handlebars = require('handlebars');

exports.register = (server, options, next) => {
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

  server.auth.strategy('jwt', 'jwt', {
    key: config('/auth/secret'),
    validateFunc: ioc.create('auth/validateJWT'),
    verifyOptions: { algorithms: [ 'HS256' ] }
  });

  ioc.use(function(id) {
    if (id === 'server') {
      server['@literal'] = true;
      return server;
    }
  });

  Promise.all([
    ioc.create('example/example-routes'),
    ioc.create('user/user-routes'),
    ioc.create('client/client-routes'),
  ])
  .then(routeArrays => {
    routeArrays.forEach(routes => {
      server.route(routes);
    });
  })
  .catch(e => console.error(e));

  next();
};

exports.register.attributes = {
  name  : 'template-bootstrap',
  version : '0.0.1'
};
