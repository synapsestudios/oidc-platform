const bcrypt = require('bcrypt');
const Boom = require('boom');
const uuid = require('uuid');
const bookshelf = require('../../lib/bookshelf');

module.exports = (emailService, clientService, RedisAdapter, themeService, userEmails, emailTokenService) => {
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
        const email = query.email.replace(/[\*%]+/g, '%');
        const wildcardSearch = email.indexOf('%') > -1;

        if (wildcardSearch) {
          model = model.where('email_lower', 'LIKE', email.toLowerCase());
        } else {
          model = model.where('email_lower', query.email.toLowerCase());
        }
      }

      return model.fetchAll();
    },

    async resendUserInvite({userId, client_id, redirect_uri, response_type, scope, hours_till_expiration, subject, template, nonce}) {
      const user = await bookshelf.model('user').where({ id: userId }).fetch();
      if (!user) throw Boom.notFound();
      const client = await clientService.findById(client_id);
      const query = {
        client_id,
        redirect_uri,
        response_type,
        subject,
        scope,
      };
      if (nonce) query.nonce = nonce;

      await userEmails.sendInviteEmail(user, client, hours_till_expiration, template, query);
      return user;
    },

    async inviteUser({email, hours_till_expiration, template, app_metadata, profile, ...payload}) {
      const client = await clientService.findById(payload.client_id);
      return bookshelf.transaction(async trx => {
        let user = await bookshelf.model('user').where({ email }).fetch();

        if (!user) {
          user = await self.create(email, uuid.v4(), {
            app_metadata: app_metadata || {},
            profile : profile || {}
          }, { transacting: trx });
        }

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

    async sendUserVerification(userId, clientId, redirectUri) {
      const user = await bookshelf.model('user').where({ id: userId }).fetch();
      if (!user) throw Boom.notFound();
      const client = await clientService.findById(clientId);
      const query = {
        client_id: clientId,
        redirect_uri: redirectUri,
      };

      await userEmails.sendVerificationEmail(user, client, user.get('email'), query);
      return user;
    },

    async sendForgotPassword(userId, clientId, redirectUri) {
      const user = await bookshelf.model('user').where({ id: userId }).fetch();
      if (!user) throw Boom.notFound();
      const client = await clientService.findById(clientId);
      const query = {
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code id_token',
        scope: 'openid',
      };

      await userEmails.sendForgotPasswordEmail(user, client, user.get('email'), query);
      return user;
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

    invalidateSession(sessionId) {
      return self.redisAdapter.destroy(sessionId);
    },

    invalidateSessionByUserId(userId) {
      return self.redisAdapter.getAndDestroySessionsByUserId(userId);
    },

    delete: function(id) {
      return bookshelf.model('user').forge({ id }).destroy();
    },

  };

  return self;
};

module.exports['@singleton'] = true;
module.exports['@require'] = [
  'email/email-service',
  'client/client-service',
  'oidc-adapter/redis',
  'theme/theme-service',
  'user/user-emails',
  'email-token/email-token-service',
];
