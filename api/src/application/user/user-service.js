const bcrypt = require('bcrypt');
const Boom = require('boom');
const Hoek = require('hoek');
const config = require('../../../config');
const uuid = require('uuid');
const handlebars = require('handlebars');
const querystring = require('querystring');
const userViews = require('./user-views');

module.exports = (bookshelf, emailService, clientService, renderTemplate, RedisAdapter, themeService) => {
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

    async sendInvite(user, appName, hoursTillExpiration, templateOverride, query) {
      Hoek.assert(Hoek.contain(
        Object.keys(query),
        ['client_id', 'redirect_uri', 'scope'],
      ), new Error('query must containe client_id, redirect_uri, and scope'));

      const token = await self.createPasswordResetToken(user.get('id'), hoursTillExpiration);
      const viewContext = userViews.inviteEmail(appName, config('/baseUrl'), {...query, token: token.get('token')});
      let emailBody;

      if (templateOverride) {
        const emailTemplate = handlebars.compile(templateOverride);
        emailBody = emailTemplate(viewContext);
      } else {
        emailBody = await themeService.renderThemedTemplate(query.client_id, 'invite-email', viewContext);

        if (!emailBody) {
          emailBody = await renderTemplate('invite-email', viewContext, {
            layout: 'email',
          });
        }
      }

      return await emailService.send({
        to: user.get('email'),
        subject: `${appName} Invitation`,
        html: emailBody,
      });
    },

    resendUserInvite(userId, appName, clientId, redirectUri, scope, hoursTillExpiration, template, nonce) {
      return bookshelf.model('user').where({ id: userId }).fetch().then(user => {
        if (!user) {
          return Boom.notFound();
        }
        return clientService.findByRedirectUriAndClientId(clientId, redirectUri).then(clients => {
          if (clients.models.length === 0) {
            throw Boom.badData('The provided redirect uri is invalid for the given client id.');
          }

          const query = {
            client_id: clientId,
            redirect_uri: redirectUri,
            scope,
          };
          if (nonce) query.nonce = nonce;
          return self.sendInvite(user, appName, hoursTillExpiration, template, query).then(() => user);
        });

      });
    },

    inviteUser({email, app_name, hours_till_expiration, template, app_metadata, profile, ...payload}) {
      return clientService.findByRedirectUriAndClientId(payload.client_id, payload.redirect_uri).then(clients => {
        if (clients.models.length === 0) {
          throw Boom.badData('The provided redirect uri is invalid for the given client id.');
        }
      }).then(()=> self.create(
        email,
        uuid.v4(),
        {
          app_metadata: app_metadata || {},
          profile : profile || {}
        }
      )).then(user => {
        return self.sendInvite(
          user,
          app_name,
          hours_till_expiration,
          template,
          payload
        ).then(() => user);
      });
    },

    create: function(email, password, additional) {
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
        }).save({}, {method: 'insert'}));
    },

    update: function(id, payload) {
      return bookshelf.model('user').forge({ id }).save(payload, { patch: true });
    },

    findByEmailForOidc: function(email) {
      return bookshelf.model('user').where({ email_lower: email.toLowerCase() }).fetch()
        .then(user => user ? user.serialize({strictOidc: true}) : null);
    },

    findById: function(id) {
      return bookshelf.model('user').where({ id }).fetch();
    },

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

    destroyPasswordToken: function(token) {
      return bookshelf.model('user_password_reset_token').forge({ token }).destroy();
    },

    createPasswordResetToken: function(id, hoursTillExpiration) {
      hoursTillExpiration = hoursTillExpiration || 1;
      const expires = new Date();
      expires.setHours(expires.getHours() + hoursTillExpiration);

      return bookshelf.model('user_password_reset_token').forge({
        token: uuid.v4(),
        user_id: id,
        expires_at: expires,
      }).save({}, {method: 'insert'});
    },

    invalidateSession(sessionId) {
      return self.redisAdapter.destroy(sessionId);
    },

    async sendForgotPasswordEmail(email, query, token) {
      const base = config('/baseUrl');
      const newQuery = querystring.stringify(Object.assign({}, query, { token: token.get('token') }));
      let template = await themeService.renderThemedTemplate(query.client_id, 'forgot-password-email', {
        url: `${base}/user/reset-password?${newQuery}`
      });

      if (!template) {
        template = await renderTemplate('forgot-password-email', {
          url: `${base}/user/reset-password?${newQuery}`,
        }, {
          layout: 'email',
        });
      }

      emailService.send({
        to: email,
        subject: 'Reset your password',
        html: template,
      });
    },
  };

  return self;
};

module.exports['@singleton'] = true;
module.exports['@require'] = [
  'bookshelf',
  'email/email-service',
  'client/client-service',
  'render-template',
  'oidc-adapter/redis',
  'theme/theme-service',
];
