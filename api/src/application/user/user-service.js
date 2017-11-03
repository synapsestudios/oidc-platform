const bcrypt = require('bcrypt');
const Boom = require('boom');
const config = require('../../../config');
const uuid = require('uuid');
const handlebars = require('handlebars');
const querystring = require('querystring');
const userViews = require('./user-views');
const bookshelf = require('../../lib/bookshelf');

module.exports = (emailService, clientService, renderTemplate, RedisAdapter, themeService, userEmails, emailTokenService) => {
  var self = {
    redisAdapter: new RedisAdapter('Session'),

    encryptPassword: function(password) {
      return new Promise((resolve, reject) => {
        bcrypt.genSalt(10, (err, salt) => {
          if (err) reject(err);
          bcrypt.hash(password, salt, (err, hash) => {
            if (err) reject(err);
            resolve(hash);
          });
        });
      });
    },

    getUsers(query) {
      let model = bookshelf.model('user');
      if (query.ids) {
        model = model.where('id', 'in', query.ids);
      }

      if (query.email) {
        model = model.where('email_lower', query.email.toLowerCase());
      }

      return model.fetchAll();
    },

    async resendUserInvite(userId, clientId, redirectUri, responseType, scope, hoursTillExpiration, template, nonce) {
      const user = await bookshelf.model('user').where({ id: userId }).fetch();
      if (!user) throw Boom.notFound();
      const client = await clientService.findById(clientId);
      const query = {
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: responseType,
        scope,
      };
      if (nonce) query.nonce = nonce;

      await userEmails.sendInviteEmail(user, client, hoursTillExpiration, template, query);
      return user;
    },

    async inviteUser({email, hours_till_expiration, template, app_metadata, profile, ...payload}) {
      const client = await clientService.findById(payload.client_id);
      return bookshelf.transaction(async trx => {
        const user = await self.create(email, uuid.v4(), {
          app_metadata: app_metadata || {},
          profile : profile || {}
        }, { transacting: trx });

        await userEmails.sendInviteEmail(
          user,
          client,
          hours_till_expiration,
          template,
          payload,
          { transacting: trx }
        );

        return user;
      });
    },

    create: function(email, password, additional, saveOptions) {
      additional = additional || {};
      const app_metadata = additional.app_metadata || [];
      const profile = Object.assign(
        {
          email_verified: false,
          phone_number_verified: false,
        },
        additional.profile || {}
      );

      return self.encryptPassword(password)
        .then(hashedPass => bookshelf.model('user').forge({
          id : uuid.v4(),
          email: email,
          email_lower: email.toLowerCase(),
          password : hashedPass,
          profile,
          app_metadata
        }).save({}, Object.assign({method: 'insert'}, saveOptions)));
    },

    update: function(id, payload) {
      return bookshelf.model('user').forge({ id }).save(payload, { patch: true });
    },

    findByEmail: function(email) {
      return bookshelf.model('user').where({ email_lower: email.toLowerCase() }).fetch();
    },

    findById: function(id) {
      return bookshelf.model('user').where({ id }).fetch();
    },

    /**
     * @deprecated - use email tokens instead
     */
    findByPasswordToken: function(token) {
      return bookshelf.model('user_password_reset_token')
        .forge({ token })
        .where('expires_at', '>', bookshelf.knex.fn.now())
        .fetch()
        .then(tokenModel => {
          if (tokenModel) {
            return self.findById(tokenModel.get('user_id'));
          }
          return null;
        });
    },

    /**
     * @deprecated - use email tokens instead
     */
    destroyPasswordToken: function(token) {
      return bookshelf.model('user_password_reset_token').forge({ token }).destroy();
    },

    invalidateSession(sessionId) {
      return self.redisAdapter.destroy(sessionId);
    },
  };

  return self;
};

module.exports['@singleton'] = true;
module.exports['@require'] = [
  'email/email-service',
  'client/client-service',
  'render-template',
  'oidc-adapter/redis',
  'theme/theme-service',
  'user/user-emails',
  'email-token/email-token-service',
];
