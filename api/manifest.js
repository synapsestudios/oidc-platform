const ioc = require('electrolyte');
const GoodWinston = require('good-winston');
const fs = require('fs');

const config = require('./config');
const formatError = require('./src/lib/format-error');
const fetchKeystore = require('./src/lib/fetch-keystore');
const logger = require('./src/lib/logger');
const env = require('./config')('/env');

ioc.use(ioc.dir('src/lib'));
ioc.use(ioc.dir('src/application'));

const connections = [{ port: 9000 }];

if (env === 'development') {
  connections[0].tls = {
    key: fs.readFileSync('dev.key'),
    cert: fs.readFileSync('dev.crt'),
  };

  connections.push({ port: 9001 });
}

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
          cors: {
            origin: ['*'],
          },
          validate: {
            options: { abortEarly: false },
            failAction: (request, reply, source, error) => {
              reply(formatError(error));
            }
          }
        }
      }
    },
    connections,
    registrations: [
      {
        plugin: {
          register: 'hapi-auth-jwt2'
        }
      },
      {
        plugin: {
          register: './plugins/access-token-scheme',
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
              winston: [ new GoodWinston({ winston: logger }) ]
            }
          }
        },
      },
      {
        plugin: {
          register: './plugins/openid-connect/openid-connect',
          options: {
            logger,
            prefix: 'op',
            getTemplate: lib.themeService.renderThemedTemplate.bind(lib.themeService),
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
            renderError: async (ctx, error) => {
              ctx.type = 'html';
              ctx.body = await lib.themeService.renderThemedTemplate('error', {
                ...error,
                systemError: true,
                production: env === 'production',
              });
            }
          }
        }
      }
    ]
  }))
  .catch(e => {
    logger.error(e);
    process.exit(1);
  });
