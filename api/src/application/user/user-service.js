const bcrypt = require('bcrypt');
const uuid = require('uuid');

module.exports = (bookshelf, emailService) => {
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

    comparePasswords: function(password, user) {
      var hash = user.get('password');
      return new Promise(function(resolve, reject) {
        bcrypt.compare(password, hash, function(err, res) {
          if (res) {
            resolve(true);
          } else {
            resolve(false);
          }
        });
      });
    },

    inviteUser(payload) {
      return this.create(
        payload.email,
        uuid.v4(),
        {
          app_metadata: payload.app_metadata || {},
          profile : payload.profile || {}
        }
      ).then(user => {
        return this.createPasswordResetToken(user.get('id'));
      }).then(token => {
        console.log('got token', token);
        return token;
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

      return this.encryptPassword(password)
        .then(hashedPass => bookshelf.model('user').forge({
          id : uuid.v4(),
          email,
          password : hashedPass,
          profile,
          app_metadata
        }).save({}, {method: 'insert'}));
    },

    update: function(id, payload) {
      return bookshelf.model('user').forge({ id }).save(payload);
    },

    authenticate: function(email, password) {
      return bookshelf.model('user').where({ email }).fetch()
        .then(user => {
          if (!user) throw new Error('No user found for this email');
          return self.comparePasswords(password, user)
            .then(isAuthenticated => {
              if (!isAuthenticated) throw new Error('Password does not match record');
              return user.serialize({strictOidc: true});
            });
        });
    },

    findByIdForOidc: function(id) {
      return bookshelf.model('user').where({ id }).fetch()
        .then(user => user.serialize({ strictOidc: true }));
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

    createPasswordResetToken: function(id) {
      const expires = new Date();
      expires.setHours(expires.getHours() + 1);

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
module.exports['@require'] = ['bookshelf', 'email/email-service'];
