const Boom = require('boom');
const base64url = require('base64url');
const uuid = require('uuid/v4');
const get = require('lodash/get');

const epochTime = (date = Date.now()) => Math.floor(date / 1000);

async function getSession(req, res) {
  const ctx = this.app.createContext(req, res);
  return this.Session.get(ctx);
}

async function setProviderSession(req, res, {
  account,
  ts = epochTime(),
  remember = true,
  clients = [],
} = {}) {
  const session = await getSession.call(this, req, res);
  Object.assign(session, {
    account,
    loginTs: ts,
  });
  if (!remember) session.transient = true;
  clients.forEach((clientId) => {
    session.sidFor(clientId, uuid());
  });
  await session.save();
  return session;
}

exports.register = function (server, pluginOptions, next) {
  server.auth.scheme('oidc_session', () => {
    return {
      async authenticate(request, reply) {
        if (!request.state._session) {
          const authorization = get(request, 'headers.authorization', '');
          const tokenString = authorization ? authorization.split(' ')[1] : null;
          if (request.query.id_token_hint || tokenString) {
            // only do this when cookies aren't present and some token hint is provided or whatever
            const parts = String(request.query.id_token_hint || tokenString).split('.');
            const token = {
              header: JSON.parse(base64url.decode(parts[0])),
              payload: JSON.parse(base64url.decode(parts[1])),
            };

            try {
              const session = await setProviderSession.call(server.plugins['open-id-connect'].provider, request.raw.req, request.raw.res, {
                account: token.payload.sub
              });

              reply.continue({
                credentials: session,
              });
            } catch(e) {
              reply(e);
            }
          } else {
            reply(Boom.unauthorized(null, 'oidc_session'));
          }
        } else {
          try {
            var session = await request.server.plugins['open-id-connect'].provider.Session.find(request.state._session);
            if (!session.accountId()) {
              reply(Boom.unauthorized(null, 'oidc_session'));
            } else {
              reply.continue({
                credentials: session,
              });
            }
          } catch(e) {
            reply(e);
          }
        }
      }
    };
  });

  next();
};

exports.register.attributes = {
  name: 'oidc-session-scheme',
  version: '1.0.0'
};
