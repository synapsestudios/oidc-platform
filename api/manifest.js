var config = require('./config');
var formatError = require('./src/lib/format-error');

var ioc = require('electrolyte');
ioc.use(ioc.dir('src/lib'));
ioc.use(ioc.dir('src/application'));

module.exports = Promise.all([
  ioc.create('bookshelf'),
  ioc.create('client/client-routes'), // this registers the client models
])
.then(values => ({
  server : {
    connections: {
      routes: {
        validate: {
          options: { abortEarly: false },
          failAction: (request, reply, source, error) => {
            reply(formatError(error));
          }
        }
      }
    }
  },
  connections : [{
    port : 9000
  }],
  registrations : [
    {
      plugin : {
        register : 'hapi-auth-jwt2'
      }
    },
    {
      plugin : {
        register : 'vision',
      }
    },
    {
      plugin : {
        register : '../bootstrap'
      }
    },
    {
      plugin : {
        register : 'hapi-email-kue',
        options : config('/email')
      }
    },
    {
      plugin : {
        register : './plugins/openid-connect/openid-connect',
        options : {
          prefix : 'op',
          clientsPromise : values[0].model('client').fetchAll({
            withRelated: ['grant_types', 'contacts', 'redirect_uris'],
          }).then(clients => clients.serialize({strictOidc: true}))
        }
      }
    }
  ]
}));
