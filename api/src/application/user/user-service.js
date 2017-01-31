const bcrypt = require('bcrypt');
const uuid = require('uuid');

module.exports = (bookshelf) => {
  return {
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
            resolve();
          } else {
            reject();
          }
        });
      });
    },

    create: function(email, password) {
      return this.encryptPassword(password)
        .then(hashedPass => bookshelf.model('user').forge({
          id : uuid.v4(),
          email,
          password : hashedPass
        }).save({}, {method: 'insert'}));
    },

    authenticate: function(email, password) {
      return Promise.reject();
    },

    findById: function(id) {
      return {
        accountId : id,
        claims : function() {
          return {
            address: {
              country: '000',
              formatted: '000',
              locality: '000',
              postal_code: '000',
              region: '000',
              street_address: '000',
            },
            birthdate: '1987-10-16',
            email: 'johndoe@example.com',
            email_verified: false,
            family_name: 'Doe',
            gender: 'male',
            given_name: 'John',
            locale: 'en-US',
            middle_name: 'Middle',
            name: 'John Doe',
            nickname: 'Johny',
            phone_number: '+49 000 000000',
            phone_number_verified: false,
            picture: 'http://lorempixel.com/400/200/',
            preferred_username: 'Jdawg',
            profile: 'https://johnswebsite.com',
            sub: this.accountId,
            updated_at: 1454704946,
            website: 'http://example.com',
            zoneinfo: 'Europe/Berlin',
          };
        }
      };
    }

  };
};

module.exports['@singleton'] = true;
module.exports['@require'] = ['bookshelf'];
