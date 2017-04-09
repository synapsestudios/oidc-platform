const bcrypt = require('bcrypt');
const Boom = require('boom');
const config = require('../../../config');
const uuid = require('uuid');

module.exports = (bookshelf, emailService, renderTemplate) => {
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

    getUsers(ids) {
      return bookshelf.model('user').query(qb => qb.whereIn('id', ids)).fetchAll();
    },

    sendInvite(user, appName, hoursTillExpiration) {
      return self.createPasswordResetToken(user.get('id'), hoursTillExpiration).then(token => {
        const base = config('/baseUrl');
        return renderTemplate('email/invite', {
          url: `${base}/user/accept-invite?token=${token.get('token')}`,
          appName: appName
        });
      }).then(emailBody => {
        return emailService.send({
          to: user.get('email'),
          subject: `${appName} Invitation`,
          html: emailBody,
        });
      });
    },

    resendUserInvite(userId, appName, hoursTillExpiration) {
      return bookshelf.model('user').where({ id: userId }).fetch().then(user => {
        if (!user) {
          return Boom.notFound();
        }

        return self.sendInvite(user, appName, hoursTillExpiration).then(() => user);
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
          payload.hours_till_expiration
        );
      }).then(() => createdUser);
    },

    getByEmail(email) {
      return bookshelf.model('user').where({email}).fetch();
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
      return bookshelf.model('user').forge({ email }).fetch()
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
  };

  return self;
};

module.exports['@singleton'] = true;
module.exports['@require'] = [
  'bookshelf',
  'email/email-service',
  'render-template',
];
