const bcrypt = require('bcrypt');
const Boom = require('boom');
const config = require('../../../config');
const uuid = require('uuid');
const querystring = require('querystring');

module.exports = (bookshelf, emailService, clientService, renderTemplate) => {
  var self = {
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
        model = model.where('email', query.email);
      }

      return model.fetchAll();
    },

    sendInvite(user, appName, clientId, scope, hoursTillExpiration) {
      return self.createPasswordResetToken(user.get('id'), hoursTillExpiration).then(token => {
        const base = config('/baseUrl');

        clientService.findRedirectUriByClientId(clientId).then(client => {
          const url = encodeURI(`${base}/user/accept-invite?token=${token.get('token')}&client_id=${clientId}&redirect_uri=${client.attributes.uri}&scope=${scope}`);
          return renderTemplate('email/invite', {
              url: url.replace(' ', '%20'),
              appName: appName
            });
          }).then(emailBody => {
            return emailService.send({
              to: user.get('email'),
              subject: `${appName} Invitation`,
              html: emailBody,
            }).then(data => {console.log(data)}).catch(error => {console.log(error)});
        });
        
      });
    },

    resendUserInvite(userId, appName, clientId, scope, hoursTillExpiration) {
      return bookshelf.model('user').where({ id: userId }).fetch().then(user => {
        if (!user) {
          return Boom.notFound();
        }

        return self.sendInvite(user, appName, clientId, scope, hoursTillExpiration).then(() => user);
      });
    },

    inviteUser(payload) {
      let createdUser;
      return self.create(
        payload.email,
        uuid.v4(),
        {
          app_metadata: payload.app_metadata || {},
          profile : payload.profile || {}
        }
      ).then(user => {
        createdUser = user;
        return self.sendInvite(
          user,
          payload.app_name,
          payload.client_id,
          payload.scope,
          payload.hours_till_expiration
        );
      }).then(() => createdUser);
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
          email,
          password : hashedPass,
          profile,
          app_metadata
        }).save({}, {method: 'insert'}));
    },

    update: function(id, payload) {
      return bookshelf.model('user').forge({ id }).save(payload, { patch: true });
    },

    findByEmailForOidc: function(email) {
      return bookshelf.model('user').where({ email }).fetch();
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
  };

  return self;
};

module.exports['@singleton'] = true;
module.exports['@require'] = [
  'bookshelf',
  'email/email-service',
  'client/client-service',
  'render-template',
];
