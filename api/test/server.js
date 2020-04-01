const Glue = require('glue');
const ioc = require('electrolyte');
const manifestPromise = require('../manifest');
const keystore = require('../keystore');
const s3 = require('../src/lib/s3');
const bookshelf = require('../src/lib/bookshelf');

// Prevent s3 calls that happen on initialize
s3.getObject = function(params) {
  // If retrieving the keystore used to sign JWTs, return from local file
  if (
    params.Bucket === process.env.KEYSTORE_BUCKET &&
    params.Key === process.env.KEYSTORE
  ) {
    return {
      promise: () => new Promise(
        resolve => resolve({
          Body: Buffer.from(JSON.stringify(keystore))
        })
      )
    };
  } else {
    throw new Error('Not expecting getObject call');
  }
};

const options = {
  relativeTo: __dirname + '/../src',
};

module.exports = async function() {
  const manifest = await manifestPromise;

  // Remove good from plugins.
  manifest.registrations = manifest.registrations.filter(registration =>
    !(registration.plugin &&
    registration.plugin.options &&
    registration.plugin.options.reporters)
  );

  try {
    const server = await Glue.compose(manifest, options);

    // Register the same auth strategies and routes as the main server.js
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

    const routes = [
      await ioc.create('api/api-routes'),
      await ioc.create('user/user-routes'),
    ];

    routes.forEach(routes => {
      server.route(routes);
    });

    server.initialize();

    return server;
  } catch (e) {
    console.log(e);
  }
};
