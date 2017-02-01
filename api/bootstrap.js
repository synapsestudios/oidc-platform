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

  options.routeArrays.forEach(routes => {
    server.route(routes);
  });

  next();
};

exports.register.attributes = {
  name  : 'template-bootstrap',
  version : '0.0.1'
};
