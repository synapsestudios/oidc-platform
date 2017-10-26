const config = require('./config');
const formatError = require('./src/lib/format-error');
const fetchKeystore = require('./src/lib/fetch-keystore');
const handlebars = require('handlebars');

var ioc = require('electrolyte');
ioc.use(ioc.dir('src/lib'));
ioc.use(ioc.dir('src/application'));

module.exports = Promise.all([
  ioc.create('bookshelf'),
  ioc.create('user/user-oidc-service'),
  ioc.create('oidc-adapter/redis'),
  ioc.create('oidc-adapter/sql'),
  ioc.create('theme/theme-service'),
  fetchKeystore(),
])
  .then(values => ({
    bookshelf: values[0],
    userService: values[1],
    redisOidcAdapter: values[2],
    sqlOidcAdapter: values[3],
    themeService: values[4],
    keystore: values[5],
  }))
  .then(lib => ({
    server: {
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
    connections: [{
      port: 9000
    }],
    registrations: [
      {
        plugin: {
          register: 'hapi-auth-jwt2'
        }
      },
      {
        plugin : {
          register: 'vision',
        }
      },
      {
        plugin: {
          register: './plugins/access-token-scheme'
        }
      },
      {
        plugin: {
          register: './plugins/oidc-session-scheme',
        }
      },
      {
        plugin: {
          register: './plugins/email-token-scheme',
        }
      },
      {
        plugin: {
          register: 'good',
          options: {
            reporters: {
              consoleReporter: [
                {module: 'good-squeeze', name: 'Squeeze', args: [{log: '*', response: '*', error: '*', request: '*'}]},
                {module: 'good-console'},
                'stdout'
              ]
            }
          }
        },
      },
      {
        plugin: {
          register: './plugins/openid-connect/openid-connect',
          options: {
            vision: {
              engines: {
                hbs: handlebars
              },
              path: './templates',
              layout: true,
              layoutPath: './templates/layout',
              layout: 'default',
            },
            prefix: 'op',
            getTemplate: lib.themeService.renderThemedTemplate,
            authenticateUser: lib.userService.authenticate,
            findUserById: lib.userService.findByIdWithCtx,
            userRegistration: config('userRegistration'),
            pairwiseSalt: config('/oidc/pairwiseSalt'),
            cookieKeys: config('/oidc/cookieKeys'),
            initialAccessToken: config('/oidc/initialAccessToken'),
            adapter: function OidcAdapterFactory(name) {
              return (name === 'Client') ? new lib.sqlOidcAdapter(name): new lib.redisOidcAdapter(name);
            },
            keystore: lib.keystore,
          }
        }
      }
    ]
  }));
